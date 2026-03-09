pipeline{
    agent any
    options {
        buildDiscarder(logRotator(numToKeepStr: '5')) 
    }
    stages{
        stage('Build Docker app'){
            
            steps{
                script {
                    if (isUnix()) {
                        withCredentials([string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL')]) {
                            sh 'docker build --build-arg DATABASE_URL="${DATABASE_URL}" -t ganuthebabu/mini_prog:latest .'
                        }
                    }else {
                        withCredentials([string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL')]) {
                            sh 'docker build --build-arg DATABASE_URL="${DATABASE_URL}" -t ganuthebabu/mini_prog:latest .'
                        }
                    }
                }
            }
        }
        stage('Push'){
            
            steps{
                script {
                    withCredentials([usernamePassword(credentialsId: 'DOCKER_CREDS', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        if (isUnix()) {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            sh 'docker push ganuthebabu/mini_prog:latest'
                            sh 'docker logout'
                        } else {
                            bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                            bat 'docker push ganuthebabu/mini_prog:latest'
                            bat 'docker logout'
                        }
                    }
                }   
            }
        }
    }
}