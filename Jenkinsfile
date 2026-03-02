pipeline{
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '5')) 
    }
    stages{
        stage('Build'){
            steps{
                bat 'npm install'
                bat 'npm run build'
            }
        }
    }
}