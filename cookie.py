import os
import json
import MySQLdb
import hashlib

print "Welcome to cookie cutter"
print "Answer the following questions"

projectName=raw_input("Name (Default-testing): ")
if projectName=="":
	projectName="testing"

projectVersion=raw_input("Version (Default-1.0.0): ")
if projectVersion=="":
	projectVersion="1.0.0"

projectDescr=raw_input("Description (Default-testing): ")
if projectDescr=="":
	projectDescr="testing"

projectDB=raw_input("Database (Default-"+projectName+"): ")
if projectDB=="":
	projectDB=projectName

projectGit=raw_input("Git (Default-null): ")

os.system("git clone https://github.com/Tyranicangel/cookiecutter.git "+projectName)

dirPath=os.getcwd()

os.system("rmdir "+dirPath+"\\"+projectName+"\\.git /s /q")

os.chdir(projectName)

db1 = MySQLdb.connect(host="localhost",user="root",passwd="")
cursor = db1.cursor()
sql = 'CREATE DATABASE '+projectDB
cursor.execute(sql)

pjson={
  "name": projectName,
  "version": projectVersion,
  "description": projectDescr,
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": projectGit
  },
  "author": "Pixelvide",
  "license": "ISC",
  "bugs": {
    "url": projectGit+"/issues"
  },
  "homepage": projectGit,
  "dependencies": {
    "angular": "^1.5.2",
    "angular-ui-router": "^0.2.18",
    "bootstrap": "^3.3.6",
    "font-awesome": "^4.5.0",
    "jquery": "^2.2.2"
  }
}

with open('package.json','w') as outfile:
	json.dump(pjson,outfile)

os.chdir("api")

m=hashlib.sha256("admin123456"+projectName).hexdigest()

replacements = {'cookie': projectName,"8e224b65d380e94ab3f59cbef89e74e372857d4b40e38475d0e05c4c73c3ee02":m}

lines = []
with open('app\\Http\\Controllers\\CommonController.php') as infile:
	for line in infile:
		for src, target in replacements.iteritems():
			line = line.replace(src, target)
		lines.append(line)
with open('app\\Http\\Controllers\\CommonController.php', 'w') as outfile:
	for line in lines:
		outfile.write(line)

lines = []
with open('database\\seeds\\DatabaseSeeder.php') as infile:
	for line in infile:
		for src, target in replacements.iteritems():
			line = line.replace(src, target)
		lines.append(line)
with open('database\\seeds\\DatabaseSeeder.php', 'w') as outfile:
	for line in lines:
		outfile.write(line)

envdata="APP_ENV=local\nAPP_DEBUG=true\nAPP_KEY=vjWbCCKOJ7aL6zz8nta5kcsAbFHPRvrG\nDB_HOST=localhost\nDB_DATABASE="+projectDB+"\nDB_USERNAME=root\nDB_PASSWORD=\nCACHE_DRIVER=file\nSESSION_DRIVER=file\nQUEUE_DRIVER=sync\nMAIL_DRIVER=smtp\nMAIL_HOST=mailtrap.io\nMAIL_PORT=2525\nMAIL_USERNAME=null\nMAIL_PASSWORD=null\n"

envfile=open(".env","w")

envfile.write(envdata)

os.system("php artisan migrate --force")

os.system("php artisan db:seed --force")

os.chdir("../")

replacements = {'cookietoken': projectName+'token'}

lines = []
with open('scripts\\commoncontroller.js') as infile:
	for line in infile:
		for src, target in replacements.iteritems():
			line = line.replace(src, target)
		lines.append(line)
with open('scripts\\commoncontroller.js', 'w') as outfile:
	for line in lines:
		outfile.write(line)

if projectGit!="":
	os.system("git init")
	os.system("git add .")
	os.system("git commit -a -m 'Start'")
	os.system("git remote add origin "+projectGit)
	os.system("git push -u origin master")
