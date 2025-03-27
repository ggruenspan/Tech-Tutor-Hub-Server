// controllers/publicProfileController.js

// Models (Mongoose schema)
const User = require('../../models/userSchema.js');
const Image = require('../../models/imageSchema.js');
const Project = require('../../models/projectSchema.js');

const { jwtSign } = require('../../config/jwtConfig.js');
const { createCanvas } = require('canvas'); // For generating the image

// Function to get the users profile
function getPublicProfile(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }
            
            // Fetch both projects simultaneously using Promise.all
            Promise.all([
                Project.findById(user.profile.projectOne ? user.profile.projectOne : null),
                Project.findById(user.profile.projectTwo ? user.profile.projectTwo : null)
            ])
            .then(([projectOne, projectTwo]) => {
                // Create payload with project details if they exist
                
                const payload = {
                    bio: user.profile.bio,
                    pronouns: user.profile.pronouns,
                    portfolioLink: user.profile.portfolioLink,
                    socialLink1: user.profile.socials.linkOne,
                    socialLink2: user.profile.socials.linkTwo,
                    projectOne: projectOne
                    ? {
                        name: projectOne.name,
                        desc: projectOne.desc,
                        img: {
                            data: projectOne.img.data.toString('base64'),
                            contentType: projectOne.img.contentType,
                        },
                        url: projectOne.url
                    }
                    : null,
                    projectTwo: projectTwo
                        ? {
                            name: projectTwo.name,
                            desc: projectTwo.desc,
                            img: {
                                data: projectTwo.img.data.toString('base64'),
                                contentType: projectTwo.img.contentType,
                            },
                            url: projectTwo.url
                        }
                        : null 
                };

                // Generate JWT token
                jwtSign(payload)
                .then((token) => {
                    res.status(200).json({ message: 'User profile retrieved successfully', token: token });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Error occurred while generating the token. Please try again. If the issue persists, contact support.' });
                });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error occurred while checking for existing projects. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to update users profile
function updatePublicProfile(req, res) {
    try {
        const { bio, pronouns, portfolioLink, projectOneName, projectOneUrl, projectOneDesc, 
                projectTwoName, projectTwoUrl, projectTwoDesc, socialLink1, socialLink2 } = req.body;

        // Helper function to handle project updates or creation
        const handleProject = (projectId, name, url, desc, imageFile) => {
            if (projectId) {
                // Update existing project
                return Project.findById(projectId).then(project => {
                    if (project) {
                        let updated = false;
                        if (project.name !== name) { project.name = name; updated = true; }
                        if (project.url !== url) { project.url = url; updated = true; }
                        if (project.desc !== desc) { project.desc = desc; updated = true; }
                        if (imageFile) {
                            project.img = {
                                data: imageFile[0].buffer,
                                contentType: imageFile[0].mimetype,
                            };
                            updated = true;
                        }
                        return updated ? project.save() : Promise.resolve();
                    }
                    return Promise.resolve();
                });
            } else if (name || url || desc || imageFile) {
                // Create new project if no ID exists but data is provided
                const newProject = new Project({
                    user: req.user.id,
                    name,
                    desc,
                    url,
                    img: imageFile
                        ? { data: imageFile[0].buffer, contentType: imageFile[0].mimetype }
                        : undefined,
                });
                return newProject.save();
            }
            return Promise.resolve();
        };

        User.findById(req.user.id)
        .then(user => {
            if (!user) return res.status(404).json({ message: 'No account found' });

            // Handle both projects in parallel
            return Promise.all([
                handleProject(user.profile.projectOne, projectOneName, projectOneUrl, projectOneDesc, req.files.projectOneImage),
                handleProject(user.profile.projectTwo, projectTwoName, projectTwoUrl, projectTwoDesc, req.files.projectTwoImage),
            ]).then(([projectOne, projectTwo]) => ({ user, projectOne, projectTwo }));
        })
        .then(({ user, projectOne, projectTwo }) => {
            const updateFields = {
                'profile.bio': bio,
                'profile.pronouns': pronouns,
                'profile.portfolioLink': portfolioLink,
                'profile.socials.linkOne': socialLink1,
                'profile.socials.linkTwo': socialLink2,
            };

            if (projectOne) updateFields['profile.projectOne'] = projectOne.id;
            if (projectTwo) updateFields['profile.projectTwo'] = projectTwo.id;

            return User.findByIdAndUpdate(user.id, updateFields, { new: true }).exec();
        })
        .then(() => res.status(200).json({ message: 'Profile updated!' }))
        .catch(err => res.status(500).json({ error: 'Internal server error. Please try again. If the issue persists, contact support.' }));
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function for removing a user's project
function removePublicProfileProject(req, res) {
    try {
        const { projectId } = req.params;

        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            // Determine which project to delete based on projectId
            const projectToDelete = projectId === "1" ? user.profile.projectOne : user.profile.projectTwo;
            if (!projectToDelete) {
                return res.status(404).json({ message: 'Project not found' });
            }

            console.log(projectToDelete);

            // Delete the project
            Project.findByIdAndDelete(projectToDelete).exec()
            .then(() => {
                const update = {};

                if (projectId === "1") {
                    if (user.profile.projectTwo) {
                        // Shift projectTwo to projectOne if projectOne is deleted
                        update["profile.projectOne"] = user.profile.projectTwo;
                        update["profile.projectTwo"] = { $unset: "" }; // Unset projectTwo
                    } else {
                        update["profile.projectOne"] = { $unset: "" };
                    }
                } else if (projectId === "2") {
                    // Unset projectTwo if it's deleted
                    update["profile.projectTwo"] = { $unset: "" };
                }

                // Use the correct $unset operator directly in Mongoose
                const updateQuery = {
                    $unset: {},
                    $set: {}
                };

                // Prepare updateQuery based on the conditions
                if (projectId === "1") {
                    if (user.profile.projectTwo) {
                        updateQuery.$set["profile.projectOne"] = user.profile.projectTwo;
                        updateQuery.$unset["profile.projectTwo"] = "";
                    } else {
                        updateQuery.$unset["profile.projectOne"] = "";
                    }

                } else if (projectId === "2") {
                    updateQuery.$unset["profile.projectTwo"] = "";
                }

                return User.findByIdAndUpdate(user.id, updateQuery, { new: true });
            })
            .then(() => {
                res.status(200).json({ message: 'Project removed successfully' });
            })
            .catch(err => {
                res.status(500).json({ message: 'Error occurred while removing the project. Please try again. If the issue persists, contact support.' });
            });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function for getting the user profile image
function getProfileImage(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            Image.findById(user.profile.profileImage)
            .then((image) => {
                // Ensure the requesting user is authorized to access the image
                if (image.user !== user.id) {
                    return res.status(403).json({ message: 'Forbidden' });
                } else {
                    res.status(200).json({
                        image: {
                            data: image.img.data.toString('base64'), // Encode image data to Base64
                            contentType: image.img.contentType
                        }
                    });
                }
            })
            .catch(err => {
                res.status(500).json({ message: 'Error occurred while checking for an existing profile image. Please try again. If the issue persists, contact support.' });
            });

        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        })
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
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
                desc: `Uploaded`,
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

// Function for removing a users profile image
function removeProfileImage(req, res) {
    try {
        // Find the user with the given id
        User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No account found' });
            }

            const currentProfileImageId = user.profile.profileImage;
            if (currentProfileImageId) {
                // Fetch the image details to check the description
                return Image.findById(currentProfileImageId).exec()
                    .then((image) => {
                        if (!image) {
                            return res.status(404).json({ message: 'Image not found' });
                        }

                        // Check the description of the image
                        if (image.desc === `Generated profile image for ${user.account.firstName} ${user.account.lastName}`) {
                            return res.status(403).json({ message: 'Cannot delete the default profile image' });
                        }

                        if (image.desc === `Uploaded profile image for ${user.account.firstName} ${user.account.lastName}`) {
                            // Delete the uploaded profile image
                            return Image.findByIdAndDelete(currentProfileImageId).exec()
                                .then(() => {
                                    // Generate a new profile image
                                    const initial = user.account.firstName.charAt(0).toUpperCase();
                                    const imageBuffer = generateProfileImage(initial);

                                    // Save the generated image to the Images collection
                                    const newImage = new Image({
                                        user: user.id,
                                        desc: `Generate profile image for ${user.account.firstName} ${user.account.lastName}`,
                                        img: {
                                            data: imageBuffer,
                                            contentType: 'image/png'
                                        }
                                    });

                                    return newImage.save();
                                })
                                .then((savedImage) => {
                                    // Update the user's profile with the new generated image ID
                                    user.profile.profileImage = savedImage._id;

                                    return user.save();
                                })
                                .then(() => {
                                    res.status(200).json({ message: 'Profile image deleted' });
                                });
                        }
                        return res.status(200).json({ message: 'No profile image to remove' });
                    });
            }
            // If there's no profile image, send a success message
            return res.status(200).json({ message: 'No profile image to remove' });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Error occurred while checking for an existing user. Please try again. If the issue persists, contact support.' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error. Please try again. If the issue persists, contact support.' });
    }
}

// Function to generate profile image with user's first initial
function generateProfileImage(initial) {
    const canvas = createCanvas(200, 200); // Create a 200x200 canvas
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#28A745';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text settings
    ctx.fillStyle = '#F5F5F5';
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the initial in the center of the canvas
    ctx.fillText(initial, canvas.width / 2, canvas.height / 2);

    // Convert canvas to Buffer (to save as base64 string later)
    return canvas.toBuffer('image/png');
}

// Export the controller functions
module.exports = { 
    getPublicProfile,
    updatePublicProfile,
    removePublicProfileProject,
    getProfileImage,
    uploadProfilePicture,
    removeProfileImage,
    generateProfileImage
}