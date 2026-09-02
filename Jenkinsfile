/*
  Jenkinsfile — Shivakriti Constructions CI Pipeline
  ────────────────────────────────────────────────────
  Triggered automatically by GitHub webhook on every push.

  Stages:
    1. Checkout          — get the latest code from GitHub
    2. Install (Frontend)— npm install for React/Vite frontend
    3. Build (Frontend)  — npm run build (Vite production bundle)
    4. Install (Backend) — npm install for Express backend
    5. Archive Artifacts — save the built dist/ folder in Jenkins
*/
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing frontend npm packages...'
                bat 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building Vite production bundle...'
                bat 'npm run build'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing backend npm packages...'
                dir('server') {
                    bat 'npm install'
                }
            }
        }

        stage('Archive Build') {
            steps {
                echo 'Saving dist/ build artifacts...'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true, allowEmptyArchive: true
            }
        }

    }

    post {
        success {
            echo '✅ Shivakriti Constructions build succeeded!'
        }
        failure {
            echo '❌ Build failed — check the console output above for details.'
        }
    }
}
