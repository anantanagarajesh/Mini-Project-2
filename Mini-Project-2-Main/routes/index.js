const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res, next) => {
    res.render('index.ejs');
});

router.post('/', (req, res, next) => {
    let personInfo = req.body;

    // Log username and email
    console.log('Signup - Username:', personInfo.username);
    console.log('Signup - Email:', personInfo.email);

    // Spawn a Python process to run the login record script
    const { spawn } = require('child_process');

// Spawn a Python process
const pythonProcess = spawn('python', ['C:\\Users\\JAYANTH\\Desktop\\Speaker-Recognition-master\\Mini-Project-2-Main\\signuprecord.py']);

let stdoutData = '';
let stderrData = '';

// Collect stdout data
pythonProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
});

// Collect stderr data
pythonProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
});

// When the process exits, process the collected data
pythonProcess.on('close', (code) => {
    // Trim any extraneous whitespace from stdout data
    const result = stdoutData.trim();

    if (stderrData) {
        console.error(`stderr: ${stderrData}`);
    } else {
        console.log(`stdoutData: ${stdoutData}`);
        console.log(`result: ${result}`);
        console.log(`result again: ${result}`);
    }
    console.log('Recorded audio saved successfully');
});


    


    // Handle audio file if present
    if (personInfo.recordedAudio) {
        const audioBuffer = Buffer.from(personInfo.recordedAudio, 'base64');
        const uploadsDir = path.join(__dirname, '..', '..', 'train');

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir);
        }

        const audioPath = path.join(uploadsDir, `s1.wav`);

        fs.writeFile(audioPath, audioBuffer, (err) => {
            if (err) {
                console.error('Error saving audio:', err);
                return res.status(500).send({ "Success": "Failed to save audio" });
            }
            console.log('Recorded audio saved successfully:', audioPath);
        });
    }

    // Proceed with user registration
    if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
        res.send();
    } else {
        if (personInfo.password === personInfo.passwordConf) {
            User.findOne({ email: personInfo.email }, (err, data) => {
                if (!data) {
                    User.findOne({}, (err, data) => {
                        let c = 1;
                        if (data) {
                            c = data.unique_id + 1;
                        }

                        let newPerson = new User({
                            unique_id: c,
                            email: personInfo.email,
                            username: personInfo.username,
                            password: personInfo.password,
                            passwordConf: personInfo.passwordConf
                        });

                        newPerson.save((err, Person) => {
                            if (err)
                                console.error(err);
                            else
                                console.log('Success');
                        });
                    }).sort({ _id: -1 }).limit(1);
                    res.send({ "Success": "You are registered, You can login now." });
                } else {
                    res.send({ "Success": "Email is already used." });
                }
            });
        } else {
            res.send({ "Success": "Password is not matched" });
        }
    }
});

router.get('/login', (req, res, next) => {
    res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
    let loginInfo = req.body;
    
    console.log('Login - Username:', loginInfo.email);
    console.log('Login - Password:', loginInfo.password);
     // Spawn a Python process to run the login record script
     const { spawn } = require('child_process');
     const pythonProcess = spawn('python', ['C:\\Users\\JAYANTH\\Desktop\\Speaker-Recognition-master\\Mini-Project-2-Main\\loginrecord.py']);
 
     pythonProcess.stdout.on('data', (data) => {
         console.log(`stdout: ${data}`);
     });
 
     pythonProcess.stderr.on('data', (data) => {
         console.error(`stderr: ${data}`);
     });
 
     console.log('Recorded audio saved successfully');
    if (loginInfo.recordedAudio) {
        const audioBuffer = Buffer.from(loginInfo.recordedAudio, 'base64');
        const uploadsDir = path.join(__dirname, '..', '..', 'test');

        // Ensure the uploads directory exists
        if (!fs.existsSync(uploadsDir)){
            fs.mkdirSync(uploadsDir);
        }

        const audioPath = path.join(uploadsDir, `s1.wav`);

        fs.writeFile(audioPath, audioBuffer, (err) => {
            if (err) {
                console.error('Error saving audio:', err);
                return res.status(500).send({ "Success": "Failed to save audio" });
            }
            console.log('Recorded audio saved successfully:', audioPath);
        });
    }

    User.findOne({ email: loginInfo.email }, (err, data) => {
        if (data) {
            const name = data.username;
            const email = data.email;
            const unique_id = data.unique_id;
            // Execute the Python script
            const pythonProcess = spawn('python', ['C:\\Users\\JAYANTH\\Desktop\\Speaker-Recognition-master\\src\\test.py']);
            let output = "";

            pythonProcess.stdout.on('data', (data1) => {
                output += data1.toString().trim();
                console.log(`stdout: ${output}`);
            });

            pythonProcess.on('close', () => {
                console.log(`stdout (third time): ${output}`);
                if (output === "yes") {
                    req.session.userId = "unique_id"; // Assuming you're using Express.js and setting a session variable
                    res.send({ "Success": "Success!" });
                    router.get('/profile', (req, res, next) => {
                        User.findOne({ unique_id: req.session.userId }, (err, data) => {
                            
                            res.render('data.ejs', { "name": name, "email": email });
                            
                        });
                    });
            

                } 
                else if(output === "no"){
                    res.send({ "Success": "wrong person!" });
                    
                    res.redirect('/');
                }
                else {
                    res.status(401).send({ "Error": "Wrong password!" });
                    res.redirect('/');
                }

                // Route to profile page
                
            });
        } else {
            res.send({ "Success": "This Email Is not registered!" });
        }
    });


});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/forgetpass', (req, res, next) => {
    res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
    let forgetInfo = req.body;
    
    console.log('Forget Password - Username:', forgetInfo.email);
    console.log('Forget Password - New Password:', forgetInfo.password);
    console.log('Forget Password - Confirm New Password:', forgetInfo.passwordConf);

    User.findOne({ email: forgetInfo.email }, (err, data) => {
        if (!data) {
            res.send({ "Success": "This Email Is not registered!" });
        } else {
            if (forgetInfo.password === forgetInfo.passwordConf) {
                data.password = forgetInfo.password;
                data.passwordConf = forgetInfo.passwordConf;

                data.save((err, Person) => {
                    if (err)
                        console.error(err);
                    else
                        console.log('Success');
                    res.send({ "Success": "Password changed!" });
                });
            } else {
                res.send({ "Success": "Password does not match! Both Password should be same." });
            }
        }
    });

});

module.exports = router;
