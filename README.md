# Multi-Cloud DevSecOps Automation

This project demonstrates a multi-cloud **DevSecOps** pipeline with complete automation, deployment, and monitoring using tools and services from both **AWS** and **Azure**. The pipeline integrates security testing tools like **SonarQube** and **OWASP ZAP** and leverages **Terraform** for infrastructure automation. Monitoring and observability are achieved through **Grafana**, **Prometheus**, **Loki**, and **Promtail**.

---

## Project Overview

### Key Features:

- **Multi-cloud Integration**: Uses **Azure DevOps** for CI/CD, leveraging services from both **AWS** and **Azure**.
- **Security-first Approach**: Implements security checks during the build process using **SonarQube** and **OWASP ZAP**.
- **Infrastructure as Code (IaC)**: Automates the provisioning of resources in AWS using **Terraform** within **Azure DevOps** pipelines.
- **Monitoring & Observability**: Integrates **Prometheus**, **Grafana**, **Loki**, and **Promtail** for monitoring the infrastructure and application.
  
---

## Project Architecture

1. **Azure DevOps Pipeline**: 
   - Automates the entire CI/CD process, including build, security scans, deployment, and monitoring setup.
   
2. **AWS ECR (Elastic Container Registry)**:
   - Stores Docker images built during the CI process.
   
3. **AWS ECS (Elastic Container Service)**:
   - Deploys the application in a serverless environment using **Fargate**.
   
4. **AWS Load Balancer**:
   - Distributes incoming traffic across the ECS tasks for high availability.

5. **Azure Key Vault**:
   - Stores sensitive data, such as secrets and API keys, ensuring secure access during the pipeline execution.

6. **DevSecOps Tools**:
   - **SonarQube**: Performs static code analysis to detect code quality issues and security vulnerabilities.
   - **OWASP ZAP**: Conducts dynamic application security testing (DAST) to identify vulnerabilities in running applications.

7. **Terraform**:
   - Automates the provisioning of AWS resources (ECR, ECS, Load Balancer) as part of the pipeline.

8. **Monitoring & Observability**:
   - **Prometheus**: Collects metrics from ECS tasks and infrastructure.
   - **Grafana**: Visualizes metrics for easy monitoring of application performance.
   - **Loki & Promtail**: Captures logs and makes them available for querying and analysis in Grafana.

---

## Tools and Technologies Used

### Cloud Platforms:
- **AWS**:
  - Elastic Container Registry (ECR)
  - Elastic Container Service (ECS) with Fargate
  - Elastic Load Balancer (ELB)
- **Azure**:
  - Azure DevOps (CI/CD pipelines)
  - Azure Key Vault

### DevSecOps Tools:
- **SonarQube**: Static code analysis for code quality and security.
- **OWASP ZAP**: Dynamic application security testing (DAST) for detecting vulnerabilities.

### Infrastructure as Code (IaC):
- **Terraform**: Manages the provisioning of infrastructure resources on AWS.

### Monitoring and Observability:
- **Prometheus**: Metric collection.
- **Grafana**: Visualization and dashboard creation.
- **Loki & Promtail**: Log collection and monitoring.

---

## Pipeline Overview

### 1. **Build Stage**:

- Code is pushed to **Azure Repos**.
- The **Azure DevOps pipeline** triggers the build process.
- **SonarQube** is integrated to perform static code analysis, ensuring code quality and security standards.
- The application is containerized using Docker and pushed to **AWS ECR**.

### 2. **Security Testing**:

- **OWASP ZAP** runs a DAST scan on the deployed application to identify potential vulnerabilities.

### 3. **Infrastructure Automation**:

- **Terraform** provisions resources on AWS, including the ECS cluster, ECR repository, and load balancer.
- The pipeline automates the deployment of the Docker image to **AWS ECS (Fargate)**.

### 4. **Deployment**:

- The application is deployed on AWS ECS, with traffic managed by the **AWS Load Balancer**.

### 5. **Monitoring and Observability**:

- **Prometheus** and **Grafana** are set up for monitoring the ECS cluster and application metrics.
- **Loki** and **Promtail** collect logs and feed them into Grafana for visualization.

---

## Azure DevOps Pipeline Configuration

### Example Azure DevOps YAML Pipeline:

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  AWS_REGION: 'us-east-1'
  ECR_REPOSITORY: 'multi-cloud-devsecops'
  ECS_CLUSTER: 'multi-cloud-devsecops-cluster'
  ECS_SERVICE: 'multi-cloud-devsecops-service'
  CONTAINER_NAME: 'multi-cloud-devsecops-app'

steps:
  - task: UseDotNet@2
    inputs:
      packageType: 'sdk'
      version: '5.x'
      installationPath: $(Agent.ToolsDirectory)/dotnet

  # Checkout the repository
  - checkout: self

  # Build and push Docker image to AWS ECR
  - task: Docker@2
    displayName: Build and Push Docker image
    inputs:
      containerRegistry: 'AWS_ECR'
      repository: $(ECR_REPOSITORY)
      dockerfile: '**/Dockerfile'
      tags: |
        $(Build.BuildId)

  # Terraform deployment
  - task: TerraformInstaller@0
    inputs:
      terraformVersion: '1.0.11'

  - task: TerraformTaskV2@2
    inputs:
      provider: 'aws'
      command: 'apply'
      workingDirectory: 'infrastructure/terraform'
      commandOptions: '-auto-approve'

  # Run SonarQube analysis
  - task: SonarQubePrepare@5
    inputs:
      SonarQube: 'SonarQubeServiceConnection'
      scannerMode: 'CLI'
      configMode: 'manual'
      cliProjectKey: 'multi-cloud-devsecops'
      cliSources: '.'

  - task: SonarQubeAnalyze@5

  - task: SonarQubePublish@5
    inputs:
      pollingTimeoutSec: '300'

  # Run OWASP ZAP scan
  - task: OWASPZAPScan@0
    inputs:
      scanMode: 'scan'
      targetUrl: 'http://your-deployed-app-url'

  # Deploy to ECS
  - task: AwsEcsDeploy@1
    inputs:
      awsCredentials: 'AWS'
      regionName: $(AWS_REGION)
      clusterName: $(ECS_CLUSTER)
      serviceName: $(ECS_SERVICE)
      imageTag: $(Build.BuildId)

  # Monitor and visualize with Prometheus, Grafana, Loki, and Promtail
  - script: |
      # Setup Prometheus and Grafana via Terraform
      terraform apply -auto-approve
```

---

## Monitoring and Observability

### Prometheus & Grafana:

- **Prometheus** collects real-time metrics from ECS and application services.
- **Grafana** visualizes these metrics using customizable dashboards.

### Loki & Promtail:

- **Promtail** ships logs to **Loki**, which allows querying logs in Grafana for troubleshooting and detailed analysis.

---

## How to Run

1. Clone the repository and configure the pipeline in **Azure DevOps**.
2. Set up **SonarQube** and **OWASP ZAP** in Azure DevOps for security scanning.
3. Push the code to the `main` branch to trigger the CI/CD pipeline.
4. Verify the infrastructure is provisioned on AWS using Terraform.
5. Ensure that monitoring and observability tools (Prometheus, Grafana, Loki, Promtail) are configured correctly to monitor application performance and logs.

---

![image](https://github.com/user-attachments/assets/111bbb10-b085-42dc-95ed-fbed57b13971)
![image](https://github.com/user-attachments/assets/4be48dc8-eabe-417e-9290-29d4771204a9)
![image](https://github.com/user-attachments/assets/817b5ae2-fdb3-4479-b5a0-f26bb0be227a)
![image](https://github.com/user-attachments/assets/380f4b5f-8b29-4612-a356-1d92e8951a61)
![image](https://github.com/user-attachments/assets/b4e84588-71d3-4d71-a236-7fd0afd993ed)





