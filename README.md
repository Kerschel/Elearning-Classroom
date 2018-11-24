# E Learning Cloud Test platform
This is a cloud E-Learning platform designed for COMP 6905 - Cloud Technologies. It was desinged by Andrew Singh, Kerschel James, 	Gerard Rique

# Instructions
* Clone or download the repository
* Spin up the resources by going into the aws folder and following the Instructions
  * Create a new Keypair on the EC2 Console (us-east-1)
  * Move permission file to the directory.
  * Change the permission of the file to read only (chmod 400 *keypair file* on linux)
  * Open the deployment.yml and replace [KeyName] with the one you just created.
  * Run the following command from the directory of the deployment.yml (replace <your name>):
   aws cloudformation create-stack --stack-name ec2stack-*your name* --region us-east-1 --template-body file://$PWD/deployment.yml
  * Navigate to the CloudFormation front end and view resources being created using the stackID.
* In the app.yml file replace the DATABASE_HOST with the endpoint url from the RDS make
* run the command docker-compose  -H tcp://*EC2 Instance IP*:2375 -f app.yml up -d
* To view the container made run the command docker  -H tcp://*EC2 Instance IP* ps -a
* Navigate to http://*EC2 Instance IP*:8080
