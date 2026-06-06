pipeline {
    agent { label 'slave1' }

    options {
        disableConcurrentBuilds()
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '7'))
    }

    environment {
        BACKEND_IMAGE  = "prabakaran101/realestate-backend"
        FRONTEND_IMAGE = "prabakaran101/realestate-frontend"
        IMAGE_TAG      = "b${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Checking out source code..."
                git branch: 'main',
                    credentialsId: 'GithubID',
                    url: 'https://github.com/Prabakaran101/propmarket.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                script {
                    echo "Building backend Docker image..."

                    backendImage = docker.build(
                        "${BACKEND_IMAGE}:${IMAGE_TAG}",
                        "./backend"
                    )
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    echo "Building frontend Docker image..."

                    frontendImage = docker.build(
                        "${FRONTEND_IMAGE}:${IMAGE_TAG}",
                        "./frontend"
                    )
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    echo "Pushing images to Docker Hub..."

                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {

                        backendImage.push()
                        frontendImage.push()
                    }
                }
            }
        }
    }

    post {

        success {
            echo """
==========================
BUILD SUCCESS
==========================
Backend  : ${BACKEND_IMAGE}:${IMAGE_TAG}
Frontend : ${FRONTEND_IMAGE}:${IMAGE_TAG}
==========================
"""
        }

        failure {
            echo """
==========================
BUILD FAILED
Tag: ${IMAGE_TAG}
==========================
"""
        }
    }
}
