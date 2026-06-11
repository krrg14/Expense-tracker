<h1>Stage 1</h1><h2> This stage mainly covers containerizing an application and running it in two environments like   1)Local Environment  2)Cloud Environment  using Docker-compose </h2>
<h3>Local Development Workflow</h3>

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

<h3>Architecture..</h3>

<img width="1380" height="680" alt="Screenshot 2026-06-11 181823" src="https://github.com/user-attachments/assets/778e3632-3738-48fb-afb9-3f383e8f5652" />
<br>   <br>
<img width="1914" height="1013" alt="Screenshot 2026-06-11 191221" src="https://github.com/user-attachments/assets/59711f0a-d57a-4ba5-9bcd-61bcbbb891ea" />
<br>   <br>
<img width="1919" height="426" alt="Screenshot 2026-06-11 191312" src="https://github.com/user-attachments/assets/0f37178a-0c10-47dd-882e-424571696ab5" />
