# Moodle Teacher Hub - Installation Guide

Time: 5 minutes. No technical knowledge required.

## Step 1 - Copy this link

https://www-tijc.onrender.com/public/cartridge.xml

## Step 2 - Enter your Moodle course

1. Select your course
2. Turn on editing
3. Add resource or activity
4. Choose External Tool

## Step 3 - Enter details

- Activity name: Moodle Teacher Hub
- Tool URL: paste link from step 1
- Click Save

## Step 4 - Verify it works

1. Click on the activity you created
2. If a Hebrew dashboard opens with buttons - success!
3. Otherwise see Troubleshooting

## Troubleshooting

### LTI Error / missing oauth_signature
Moodle admin needs to set Tool Type with:
- Consumer Key: yaniv-lti-tool
- Shared Secret: (contact Yaniv)

### Students not showing
Moodle for Ministry of Education does not release names via NRPS.
Solution: go to Import, upload Participants report.

### No API permission
This is normal for new teacher.
Use manual import in the meantime.
