// Trigger Jenkins build via GitHub webhook test
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from Git...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                bat 'npm install'
            }
        }

        stage('Build') {
            steps {
                echo 'Building production bundle...'
                bat 'npm run build'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo 'Build and Packaging Succeeded!'
        }
        failure {
            echo 'Build Failed! Please check the console output.'
        }
    }
}
