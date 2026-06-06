pipeline {
    agent any

    environment {
        APP_NAME          = 'realestate'
        DOCKER_REGISTRY   = "${env.DOCKER_REGISTRY ?: 'docker.io/your-dockerhub-username'}"
        IMAGE_TAG         = "${env.BUILD_NUMBER ?: 'latest'}"
        BACKEND_IMAGE     = "${DOCKER_REGISTRY}/${APP_NAME}-backend"
        FRONTEND_IMAGE    = "${DOCKER_REGISTRY}/${APP_NAME}-frontend"
        DOCKER_CREDENTIALS= 'docker-hub-credentials'   // Jenkins credentials ID
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Building branch: ${env.BRANCH_NAME} | Build: ${IMAGE_TAG}"
                checkout scm
            }
        }

        stage('Backend: Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean test -B -q'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true,
                          testResults: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Backend: Docker Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                }
            }
        }

        stage('Frontend: Docker Image') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                }
            }
        }

        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy (Docker Compose)') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    IMAGE_TAG=${IMAGE_TAG} docker-compose pull || true
                    IMAGE_TAG=${IMAGE_TAG} docker-compose up -d --build
                    docker-compose ps
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
        }
        success {
            echo "Build ${IMAGE_TAG} completed successfully!"
        }
        failure {
            echo "Build ${IMAGE_TAG} failed!"
        }
    }
}
