## BUILD THIS APPLICATION ON VARIOUS STAGES CHECKOUT THEIR WORKFLOWS AND SNAPSHOTS

# STAGE 1
Checkout Branch 2 for Docker-compose code
## This stage mainly covers containerizing an application and running it in two environments like 1) Local Environment 2) Cloud Environment using Docker-compose

## Architecture..

<img width="1380" height="680" alt="Screenshot 2026-06-11 181823" src="https://github.com/user-attachments/assets/778e3632-3738-48fb-afb9-3f383e8f5652" />

### Local Development Workflow 

---------------------------

Step 1: Develop the Application
```
Developer → Source Code
```

Step 2: Build Docker Image
```
Source Code → Docker Image
```

Step 3: Define Services with Docker Compose
```
Docker Image → docker-compose.yml
```

Step 4: Start Containers
```
docker-compose.yml → Containers
```

Step 5: Access Application Locally
```
Browser
   │
   ▼
localhost:<port>
   │
   ▼
Container
   │
   ▼
Application
```

<h3>Cloud Deployment Workflow</h3>

Step 1: Push Code to GitHub
```
Source Code → GitHub
```
Step 2: Pull Code on Cloud Server
```
GitHub → EC2
```
Step 3: Build Docker Image on EC2
```
EC2 → Docker Image
```
Step 4: Run Containers Using Docker Compose
```
Docker Image → docker-compose.yml → Containers
```
Step 5: Expose Application
```
Container Port 3000
       │
       ▼
Host Port 80
```
Step 6: Access Website
```
User Browser
      │
      ▼
Public IP / Domain
      │
      ▼
EC2 Host
      │
      ▼
Docker Container
      │
      ▼
Application
```

<br>   <br>
<img width="1914" height="1013" alt="Screenshot 2026-06-11 191221" src="https://github.com/user-attachments/assets/59711f0a-d57a-4ba5-9bcd-61bcbbb891ea" />
<br>   <br>
<img width="1919" height="426" alt="Screenshot 2026-06-11 191312" src="https://github.com/user-attachments/assets/0f37178a-0c10-47dd-882e-424571696ab5" />


# STAGE 2

## Deployed the application to Kubernetes Using Helm 

### Architecture Overview

<img width="1503" height="360" alt="image" src="https://github.com/user-attachments/assets/03100175-deeb-4534-85f3-f35774ce755c" />

<br>  <br>

This project demonstrates the deployment of an application to Kubernetes using Helm charts hosted on an AWS EC2 instance. The application is exposed externally using a Kubernetes NodePort service.

#### Workflow Diagram

```text
Developer
   │
   ▼
Application Files
   │
   ▼
GitHub Repository
   │
   ▼
AWS EC2 Instance
   │
   ▼
Helm Chart
   │
   ▼
Kubernetes Cluster
   │
   ▼
NodePort Service
   │
   ▼
EC2 Public IP:Port
```

---

## Workflow Explanation

### Step 1: Develop the Application

The developer creates the application source code and Kubernetes deployment configurations.

Files include:

* Application source code
* Dockerfile
* Helm Charts
* values.yaml
* Kubernetes Templates

```text
Developer → Application Files
```

---

### Step 2: Push Code to GitHub

The application source code is stored and version-controlled in GitHub.

```bash
git add .
git commit -m "Application Deployment"
git push origin main
```

```text
Application Files → GitHub Repository
```

---

### Step 3: Clone Repository on AWS EC2

The repository is cloned into an AWS EC2 instance which acts as the deployment server.

```text
GitHub Repository → AWS EC2 Instance
```

---

### Step 4: Deploy Application Using Helm

Helm packages and deploys Kubernetes resources from predefined templates.

Install the application:

```bash
helm install expense-release expense
```

```text
AWS EC2 Instance → Helm Chart
```

---

### Step 5: Deploy Resources to Kubernetes

Helm generates and deploys Kubernetes resources such as:

* Deployments
* Services
* ConfigMaps
* Secrets
* Persistent Volumes

```text
Helm Chart → Kubernetes Cluster
```

---

### Step 6: Expose Application Using NodePort

The Kubernetes Service is configured as a NodePort to expose the application externally.

Example:

```yaml
service:
  type: NodePort
  port: 80
  targetPort: 80
  nodePort: 30080
```

```text
Kubernetes Cluster → NodePort Service
```

---

### Step 7: Access the Application

Users can access the application using the EC2 public IP and NodePort.

Example:

```text
http://<EC2-Public-IP>:30080
```

```text
NodePort Service → EC2 Public IP:Port
```
---

## End-to-End Deployment Flow

```text
Developer
   │
   ▼
Create Application Files
   │
   ▼
Push Code to GitHub
   │
   ▼
Clone Repository on AWS EC2
   │
   ▼
Deploy Helm Chart
   │
   ▼
Create Kubernetes Resources
   │
   ▼
Expose Application via NodePort
   │
   ▼
Access Using EC2 Public IP:Port
```
##snapshots
<img width="1666" height="814" alt="image" src="https://github.com/user-attachments/assets/3f862ccc-a8b8-432e-9ece-812cbc1c7fff" />
<br>  </br>
<img width="1919" height="1016" alt="image" src="https://github.com/user-attachments/assets/b657ad18-1359-4ed7-badc-0440ff837d33" />

