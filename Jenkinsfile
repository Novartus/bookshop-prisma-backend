pipeline {
    agent any
    // environment {
    //     DB_HOST = "${env.DB_HOST}"
    //     DB_USER = "${env.DB_USER}"
    //     DB_PASS = "${env.DB_PASS}"
    //     DB_NAME = "${env.DB_NAME}"
    //     DB_PORT = "${env.DB_PORT}"
    //     MYSQL_ROOT_PASSWORD = "${env.DB_PASS}"
    //     MYSQL_DATABASE = "${env.DB_NAME}"
    // }
    stages {
        stage("Build and start test image") {
            steps {
                script{
                    // bitbucketStatusNotify buildState: "INPROGRESS"
                    if (env.BRANCH_NAME.startsWith('PR')) {
                    echo 'START BRANCH_NAME.startsWith'
                    hangoutsNotify message: " PR Build has been started",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                    echo 'END BRANCH_NAME.startsWith'
                    }else {
                    hangoutsNotify message: "Build has been started",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                    // sh "sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose"
                    // sh "sudo chmod +x /usr/local/bin/docker-compose"
                    echo 'Starting Docker Compose'
                    sh "sudo docker-compose -v"
                    echo 'Running Docker Compose Test Cases'
                    sh "sudo docker-compose run development npm run test"
                    // echo 'Running Docker Compose '
                    // sh "sudo docker-compose run development npm run start:dev"
                    }
                }
            }
        }
        stage("New PR Check"){
            when{
                branch 'PR-*'
            }
            steps {
                // hangoutsNotify message: "Testing the PR",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                // sh "sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-Linux-x86_64 -o /usr/local/bin/docker-compose"
                // sh "sudo chmod +x /usr/local/bin/docker-compose"
                echo 'Starting Docker Compose'
                sh "sudo docker-compose -v"
                echo 'Running Docker Compose Test Cases'
                sh "sudo docker-compose run development npm run test"
                // echo 'Running Docker Compose '
                // sh "sudo docker-compose run development npm run start:dev"
                echo 'PR was a success!'
            }
        }
    }

    post {
      always {
            echo 'Pipeline Completed !'
    //         sh "sudo docker-compose down || true"
      }

      success {
          script{
              echo 'PR Pipeline was Success !'
              if (env.BRANCH_NAME == 'master') {
                // bitbucketStatusNotify buildState: "SUCCESSFUL"
                hangoutsNotify message: "Master branch Build was a success",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                // // Start PM2 Process
              } else if (env.BRANCH_NAME.startsWith('PR')) {
                // bitbucketStatusNotify buildState: "SUCCESSFUL"
                hangoutsNotify message: "PR request : \n${env.BRANCH_NAME} was a success",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
              } else {
                // bitbucketStatusNotify buildState: "SUCCESSFUL"
                hangoutsNotify message: "Build of ${env.BRANCH_NAME} was a success",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
              }
                sh "sudo docker-compose down || true"
          }
      }

      failure {
          script{
              echo 'Pipeline was failure !'
              if (env.BRANCH_NAME == 'master') {
                // bitbucketStatusNotify buildState: "FAILURE"
                hangoutsNotify message: "Master branch Build was a failure",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                // // Start PM2 Process
              } else if (env.BRANCH_NAME.startsWith('PR')) {
                // bitbucketStatusNotify buildState: "FAILURE"
                hangoutsNotify message: "PR request : \n${env.BRANCH_NAME} was a failure",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
              } else {
                hangoutsNotify message: "Build of \n${env.BRANCH_NAME} was a failure",token: "bMaMLG_1-nF94ko00WxMFziiD",threadByJob: false
                // bitbucketStatusNotify buildState: "FAILURE"
              }
              echo 'Taking Down Docker Compose on failure'
              sh "sudo docker-compose down || true"
          }
      }
    }
}
