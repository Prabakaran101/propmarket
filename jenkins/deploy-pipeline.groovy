pipeline {
    agent {
        node {
            label 'slave1'
            customWorkspace '/tmp/project1'
        }
    }
    parameters {
        string(
            name: 'IMAGE_TAG',
            defaultValue: '1',
            description: 'Docker image tag to deploy'
        )
    }
    
    environment {
        AWS_REGION = 'us-west-2'
        NAMESPACE  = 'propmarket'
        RDS_NAME   = 'realestate'
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Prabakaran101/propmarket.git'
            }
        }
        stage('Configure Kubeconfig') {
            steps {
                sh '''
                aws eks update-kubeconfig --region us-west-2 --name dev-cluster
                kubectl get nodes
                '''
            }
        }
        stage('Namespace') {
            steps {
                sh '''
                kubectl apply -f kubernetes-code/00-namespace.yaml
                '''
            }
        }
        stage('Security') {
            steps {
                sh '''
                kubectl apply -f kubernetes-code/security/
                '''
            }
        }
        stage('Update RDS Endpoint') {
            steps {
                // FIX: changed ''' to """ so $AWS_REGION and $RDS_NAME are expanded by Jenkins
                sh """
                RDS_ENDPOINT=\$(aws rds describe-db-instances \\
                    --region ${AWS_REGION} \\
                    --db-instance-identifier ${RDS_NAME} \\
                    --query 'DBInstances[0].Endpoint.Address' \\
                    --output text)
                echo "RDS Endpoint: \$RDS_ENDPOINT"
                sed -i "s|RDS_ENDPOINT_PLACEHOLDER|\$RDS_ENDPOINT|g" \\
                    kubernetes-code/database/configmap.yaml
                """
            }
        }
        stage('Database Resources') {
            steps {
                sh '''
                kubectl apply -f kubernetes-code/database/
                '''
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                kubectl apply -f kubernetes-code/backend/
                kubectl apply -f kubernetes-code/frontend/
                '''
            }
        }
        stage('Networking') {
            steps {
                sh '''
                kubectl apply -f kubernetes-code/networking/
                '''
            }
        }
        stage('Deploy Selected Version') {
        steps {
                sh """
                echo "Deploying image tag: b${params.IMAGE_TAG}"
    
                kubectl set image deployment/backend \
                backend=prabakaran101/realestate-backend:b${params.IMAGE_TAG} \
                -n ${NAMESPACE}
    
                kubectl set image deployment/frontend \
                frontend=prabakaran101/realestate-frontend:b${params.IMAGE_TAG} \
                -n ${NAMESPACE}
                """
            }
        }
        stage('Verify Rollout') {
            steps {
                sh """
                kubectl rollout status deployment/backend -n ${NAMESPACE}
                kubectl rollout status deployment/frontend -n ${NAMESPACE}
                kubectl get pods -n ${NAMESPACE}
                kubectl get svc -n ${NAMESPACE}
                kubectl get ingress -n ${NAMESPACE}
                """
            }
        }
    }
}
