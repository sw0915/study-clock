# 学习闹钟 - Android APK 打包说明

## 方案1：使用 PWA Builder（推荐，无需安装工具）

### 步骤：
1. 将应用部署到支持HTTPS的服务器（如 GitHub Pages, Vercel, Netlify）
2. 访问 https://www.pwabuilder.com/
3. 输入你的应用URL
4. 点击 "Generate APK" 下载Android安装包

### 快速部署到 GitHub Pages：
```bash
# 创建 GitHub 仓库后
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/study-clock.git
git push -u origin main
# 在仓库 Settings -> Pages 启用 GitHub Pages
```

---

## 方案2：本地构建 APK（需要安装工具）

### 环境要求：
- Java JDK 17+
- Android SDK
- Node.js

### 安装依赖（Ubuntu/Debian）：
```bash
# 安装 Java
sudo apt install openjdk-17-jdk

# 安装 Android SDK
sudo apt install android-sdk

# 设置环境变量
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# 接受 SDK 许可
yes | sdkmanager --licenses

# 安装必要组件
sdkmanager "platforms;android-33" "build-tools;33.0.0"
```

### 构建 APK：
```bash
cd /home/cat/sw/clock

# 同步 Web 文件
cp index.html style.css app.js manifest.json sw.js www/

# 同步到 Android
npx cap sync android

# 构建 Debug APK
cd android
./gradlew assembleDebug

# APK 位置：
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 构建签名 Release APK：
```bash
# 生成签名密钥
keytool -genkey -v -keystore study-clock.keystore -alias study-clock -keyalg RSA -keysize 2048 -validity 10000

# 在 android/gradle.properties 添加：
# android.useAndroidX=true

# 在 android/app/build.gradle 的 android {} 中添加：
# signingConfigs {
#   release {
#     storeFile file('../../study-clock.keystore')
#     storePassword '你的密码'
#     keyAlias 'study-clock'
#     keyPassword '你的密码'
#   }
# }
# buildTypes {
#   release {
#     signingConfig signingConfigs.release
#   }
# }

# 构建
./gradlew assembleRelease
```

---

## 方案3：使用在线编译服务

### Codemagic / Bitrise / CircleCI
这些CI/CD服务提供免费的Android构建环境。

### 使用 GitHub Actions（免费）：
创建文件 `.github/workflows/build-apk.yml`：

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: |
        npm install
        npm install -g @capacitor/cli

    - name: Build
      run: |
        cp index.html style.css app.js manifest.json sw.js www/
        npx cap sync android
        cd android
        chmod +x gradlew
        ./gradlew assembleDebug

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

推送代码后，在 GitHub Actions 中下载构建好的 APK。

---

## 当前项目结构

```
/home/cat/sw/clock/
├── www/                    # Web资源（用于打包）
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── manifest.json
│   └── sw.js
├── android/                # Android项目（Capacitor生成）
│   ├── app/
│   ├── gradlew
│   └── build.gradle
├── capacitor.config.json   # Capacitor配置
├── package.json
└── manifest.json           # PWA配置
```

## 应用信息
- 包名: com.clock.study
- 应用名: 学习闹钟
- 最低Android版本: Android 5.0 (API 22)
