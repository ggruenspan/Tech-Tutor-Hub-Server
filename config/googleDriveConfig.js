const { google } = require('googleapis');
const stream = require('stream');

// Helper function to convert buffer to stream
function bufferToStream(buffer) {
  const readable = new stream.PassThrough();
  readable.end(buffer);
  return readable;
}

// Load the service account credentials
const serviceAccount = require('./GOOGLE_CREDENTIALS.json');

// Google Drive Upload Logic
exports.uploadToGoogleDrive = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'File or userName is missing' });
  }

  // const userName = req.body.userName; // Get the user's name from the request body

  const userName = "uncle bob";

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount, // Use credentials instead of keyFile
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  auth.getClient()
    .then((client) => {
      const drive = google.drive({ version: 'v3', auth: client });

      // Step 1: Create a child folder
      const folderMetadata = {
        name: userName.toUpperCase() + "'s Submission", // Folder name is the user's name
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['1uAMmy0Cm9du3fUfo7p30P5d9cDEM5zCe'], // Parent folder ID
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

          // Step 2: Upload the video to the folder
          const videoMetadata = {
            name: userName.toUpperCase() + "'s Video",
            parents: [folderId], // Upload video to the newly created folder
          };

          const media = {
            mimeType: req.file.mimetype,
            body: bufferToStream(req.file.buffer), // Use the file buffer directly
          };

          drive.files.create(
            {
              requestBody: videoMetadata,
              media: media,
              fields: 'id',
            },
            (err, videoResponse) => {
              if (err) {
                console.error('Error uploading video:', err);
                return res.status(500).json({ error: 'Failed to upload video' });
              }

              const videoId = videoResponse.data.id;

              // Step 3: Create a Google Sheet in the folder
              const sheetMetadata = {
                name: userName.toUpperCase() + "'s Data",
                mimeType: 'application/vnd.google-apps.spreadsheet',
                parents: [folderId], // Place the sheet in the same folder
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

                  // Success response
                  res.status(200).json({
                    message: 'File uploaded successfully',
                    folderId,
                    videoId,
                    sheetId,
                  });
                }
              );
            }
          );
        }
      );
    })
    .catch((err) => {
      console.error('Error authenticating:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    });
};
