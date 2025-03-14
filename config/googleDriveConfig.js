const { google } = require('googleapis');
const stream = require('stream');

// Load the service account credentials
const serviceAccount = require('./GOOGLE_CREDENTIALS.json');

// Google Drive Upload Logic
exports.uploadToGoogleDrive = (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Request body is empty' });
  }
  if (!req.files || !req.files.video || !req.files.file) {
    return res.status(400).json({ error: "Both video and profile image are required" });
  }

  const { fullName, email, bio, pronouns, availability, subjects, hourlyRate, teachingMode, languages } = req.body;
  const videoFile = req.files.video[0]; 
  const imageFile = req.files.file[0]; 

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount, 
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  auth.getClient()
    .then((client) => {
      const drive = google.drive({ version: 'v3', auth: client });
      const sheets = google.sheets({ version: 'v4', auth: client });

      // Step 1: Create a folder for the user
      const folderMetadata = {
        name: `${fullName}'s Submission`, 
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['1uAMmy0Cm9du3fUfo7p30P5d9cDEM5zCe'], 
      };

      drive.files.create(
        {
          requestBody: folderMetadata,
          fields: 'id',
        },
        (err, folderResponse) => {
          if (err) {
            console.error('Error creating folder:', err);
            return res.status(500).json({ error: 'Failed to create folder' });
          }

          const folderId = folderResponse.data.id;

          // Step 2: Upload the video and photo to the folder
          const uploadFileToDrive = (file, fileName) => {
            return new Promise((resolve, reject) => {
              const fileMetadata = {
                name: fileName,
                parents: [folderId],
              };

              const bufferStream = new stream.PassThrough();
              bufferStream.end(file.buffer);

              const media = {
                mimeType: file.mimetype,
                body: bufferStream,
              };

              drive.files.create(
                {
                  requestBody: fileMetadata,
                  media: media,
                  fields: 'id',
                },
                (err, fileResponse) => {
                  if (err) {
                    console.error(`Error uploading ${fileName}:`, err);
                    reject(err);
                  } else {
                    resolve(fileResponse.data.id);
                  }
                }
              );
            });
          };

          // Upload both video and image
          Promise.all([
            uploadFileToDrive(videoFile, `${fullName}'s Video`),
            uploadFileToDrive(imageFile, `${fullName}'s Profile Image`),
          ])
            .then(([videoId, imageId]) => {
              // Step 3: Create a Google Sheet
              const sheetMetadata = {
                name: `${fullName}'s Data`,
                mimeType: 'application/vnd.google-apps.spreadsheet',
                parents: [folderId],
              };

              drive.files.create(
                {
                  requestBody: sheetMetadata,
                  fields: 'id',
                },
                (err, sheetResponse) => {
                  if (err) {
                    console.error('Error creating Google Sheet:', err);
                    return res.status(500).json({ error: 'Failed to create Google Sheet' });
                  }

                  const sheetId = sheetResponse.data.id;

                  // Format availability into a string (e.g., "Monday: 8 AM - 8 PM, Friday: 8 AM - 8 PM")
                  const availabilityFormatted = Object.entries(JSON.parse(availability))
                    .map(([day, times]) => `${day}: ${times.start} - ${times.end}`)
                    .join(', ');

                  // Step 4: Add data to the Google Sheet
                  const values = [
                    ['Name:', fullName], // Row 1
                    ['Email:', email], // Row 2
                    ['Bio:', bio], // Row 3
                    ['Pronouns:', pronouns], // Row 4
                    ['Availability:', availabilityFormatted], // Row 5 // I need to use the Loop through availability here
                    ['Subjects:', JSON.parse(subjects).join(', ')], // Row 6
                    ['Hourly Rate:', hourlyRate], // Row 7
                    ['Teaching Mode:', teachingMode], // Row 8
                    ['Languages:', JSON.parse(languages).join(', ')], // Row 9
                  ];

                  const resource = {
                    values,
                  };

                  sheets.spreadsheets.values.update(
                    {
                      spreadsheetId: sheetId,
                      range: 'Sheet1!A1', // Start writing data from the first cell
                      valueInputOption: 'RAW', // Use 'RAW' or 'USER_ENTERED'
                      requestBody: resource,
                    }, 
                    (err, result) => {
                      if (err) {
                        console.error('Error adding data to the sheet:', err);
                        return res
                          .status(500)
                          .json({ error: 'Failed to add data to the Google Sheet' });
                      }

                      // Success response
                      res.status(200).json({
                        message: 'Successfully Submitted Tutor Registration',
                        folderId,
                        videoId,
                        sheetId,
                        updatedCells: result.data.updatedCells,
                      });
                    }
                  );
                }
              );
            })
            .catch((err) => {
              console.error('Error uploading files:', err);
              return res.status(500).json({ error: 'Failed to upload files' });
            });
        }
      );
    })
    .catch((err) => {
      console.error('Error authenticating:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    });
};