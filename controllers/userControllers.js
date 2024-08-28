// controllers/userControllers.js

// User & Image models (Mongoose schema)
const User = require('../models/userSchema.js');
const Image = require('../models/imageSchema.js');
const Project = require('../models/projectSchema.js');

const { jwtSign } = require('../config/jwtConfig.js');

// Function to get the users profile
function getUserProfile (req, res) {
    try {
        const { email } = req.user;
        // Find the user with the given email
        User.findOne({ "email.address" : email, })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'Unable to find user with email: ' + email });
            }

            const payload = {
                id: user.id,
                role: user.role,
                userName: user.userName,
                email: user.email.address,
                bio: user.profile.bio,
                pronouns: user.profile.pronouns,
                portfolioLink: user.profile.portfolioLink,
                socialLink1: user.profile.socials.linkOne,
                socialLink2: user.profile.socials.linkTwo,
                country: user.profile.location.country,
                stateProvince: user.profile.location.stateProvince,
                city: user.profile.location.city,
                timeZone: user.profile.location.timeZone,
            };

            // Generate JWT token
            jwtSign(payload)
            .then((token) => {
                res.status(200).json({ message: 'User profile retrieved successfully', token: token });
            })
            .catch((err) => {
                return res.status(500).json({ message: 'An error occurred while generating the token' });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Internal server error. Please try again' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Function to update users profile
function updateUserProfile(req, res) {
    try {
        const { email } = req.user;
        const { bio, pronouns, portfolioLink, project1Name, project1Link, project1Desc, project2Name, project2Link, 
                project2Desc, socialLink1, socialLink2, country, stateProvince, city, timeZone} = req.body;
        
        console.log(req.body);

        // Find the user with the given email
        User.findOne({ "email.address": email })
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
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
                    'profile.socials.linkTwo': socialLink2,
                    'profile.location.country': country,
                    'profile.location.stateProvince': stateProvince,
                    'profile.location.city': city,
                    'profile.location.timeZone': timeZone
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
                res.status(500).json({ error: 'Internal server error. Please try again' });
            });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

function uploadProfilePicture(req, res) {
    try {
        const { email } = req.user;

        // Find the user with the given email
        User.findOne({ "email.address" : email, })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const currentProfileImageId = user.profile.profileImage;
            if (currentProfileImageId ) {
                return Image.findByIdAndDelete(currentProfileImageId).exec();
            }

            return Promise.resolve();
        })
        .then(() => {
            let newImage = new Image({
                user: req.user.id,
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
            res.status(500).json({ error: 'Internal server error. Please try again' });
        });
    } catch(err) {
        return res.status(500).json({ message: 'Internal server error. Please try again' });
    }
}

// Controller function for verifying the user's email address
function verifyUser(req, res) {
    try {
        userId = req.user.id;

        User.findById(userId)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
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
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
    verifyUser
}