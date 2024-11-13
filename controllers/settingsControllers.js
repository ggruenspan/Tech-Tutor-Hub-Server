// controllers/settingsControllers.js

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');
const Project = require('../models/projectSchema.js');

// const { jwtSign } = require('../config/jwtConfig.js');

// Function to get the users profile
function getPublicProfile (req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            } else {
                res.status(200).json({ message: 'User profile retrieved successfully', user: user });
            }

        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to update users profile
function updatePublicProfile(req, res) {
    try {
        const { bio, pronouns, portfolioLink, project1Name, project1Link, project1Desc, project2Name, project2Link, 
                project2Desc, socialLink1, socialLink2} = req.body;
        
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            // Prepare deletion promises only if new images are uploaded
            const deleteProject1Image = req.files.project1Image && user.profile.projectOne
                ? Project.findByIdAndDelete(user.profile.projectOne).exec()
                : Promise.resolve();

            const deleteProject2Image = req.files.project2Image && user.profile.projectTwo
                ? Project.findByIdAndDelete(user.profile.projectTwo).exec()
                : Promise.resolve();

            return Promise.all([deleteProject1Image, deleteProject2Image]);
        })
        .then(() => {
            // Prepare image save promises
            const savePromises = [];

            if (req.files.project1Image) {
                const newProject1Image = new Project({
                    user: req.user.id,
                    name: project1Name,
                    desc: project1Desc,
                    img: {
                        data: req.files.project1Image[0].buffer,
                        contentType: req.files.project1Image[0].mimetype,
                    },
                    link: project1Link
                });

                savePromises.push(newProject1Image.save());
            }

            if (req.files.project2Image) {
                const newProject2Image = new Project({
                    user: req.user.id,
                    name: project2Name,
                    desc: project2Desc,
                    img: {
                        data: req.files.project2Image[0].buffer,
                        contentType: req.files.project2Image[0].mimetype,
                    },
                    link: project2Link
                });

                savePromises.push(newProject2Image.save());
            }

            // Save images if any
            return Promise.all(savePromises);
        })
        .then((savedProjects) => {
            const updateFields = {
                'profile.bio': bio,
                'profile.pronouns': pronouns,
                'profile.portfolioLink': portfolioLink,
                'profile.socials.linkOne': socialLink1,
                'profile.socials.linkTwo': socialLink2
            };

            if (req.files.project1Image) {
                updateFields['profile.projectOne'] = savedProjects[0].id;
            }

            if (req.files.project2Image) {
                updateFields['profile.projectTwo'] = savedProjects.length > 1 ? savedProjects[1].id : null;
            }

            return User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).exec();
        })
        .then(() => {
            res.status(200).json({ message: 'Profile updated!' });
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to update users profile picture
function uploadProfilePicture(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            const currentProfileImageId = user.profile.profileImage;
            if (currentProfileImageId) {
                return Image.findByIdAndDelete(currentProfileImageId).exec().then(() => user);
            }

            return Promise.resolve(user);
        })
        .then((user) => {
            let newImage = new Image({
                user: req.user.id,
                desc: `Uploaded profile image for ${user.account.firstName} ${user.account.lastName}`,
                img: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            });

            // Save the new image
            return newImage.save();
        })
        .then((savedImage) => {
            User.findByIdAndUpdate(
                req.user.id,
                { 'profile.profileImage': savedImage.id },
                { new: true }
            ).exec();

            res.status(200).json({ message: 'Profile image uploaded successfully!' });
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error. Please try again. If the issue persists, contact support.' });
        });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Controller function for verifying the user
function verifyUser(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: 'No account found' });
          }
          res.status(200).json({ message: 'User exists' });
        })
        .catch(err => {
          res.status(500).json({ message: 'Internal server error' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Export the controller functions
module.exports = { 
    getPublicProfile,
    updatePublicProfile,
    uploadProfilePicture,
    verifyUser
}