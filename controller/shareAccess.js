import accessRecord from '../modals/accessRecord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// share access of credential
export const shareAccess = async (req, res) => {
    try {
        const { email, name, userId, pinataHash } = req.body;

        // Find the user by email
        let userRecord = await accessRecord.findOne({ email });

        if (userRecord) {
            // Check if this pinataHash already exists in accessData
            const existingAccess = userRecord.accessData.find(access => access.pinataHash === pinataHash);

            if (existingAccess) {
                // Update existing record's userId and set accessFlag to true
                existingAccess.userId = userId;
                existingAccess.accessFlag = true;
            } else {
                // Add new accessData entry with accessFlag set to true
                userRecord.accessData.push({ userId, pinataHash, accessFlag: true });
            }

            const updatedRecord = await userRecord.save();
            res.status(201).send({
                success: true,
                message: "Access record updated successfully",
                updatedRecord
            });
        } else {
            // Create new access record with accessFlag set to true
            const newAccessRecord = new accessRecord({
                email,
                name,
                accessData: [{ userId, pinataHash, accessFlag: true }]
            });
            const savedRecord = await newAccessRecord.save();
            res.status(201).send({
                success: true,
                message: "Access record created successfully",
                savedRecord
            });
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while creating access record",
            error
        });
    }
};



// Get User by userId
export const getUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the record by userId inside accessData array
        const userRecord = await accessRecord.findOne({ "accessData.userId": userId });

        if (!userRecord) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        // Find the specific entry in accessData with the matching userId and accessFlag set to true
        const accessEntry = userRecord.accessData.find(entry => entry.userId === userId && entry.accessFlag === true);

        // If no accessEntry or accessFlag is false, deny access
        if (!accessEntry) {
            return res.status(403).send({
                success: false,
                message: "Access is denied or not found"
            });
        }

        const { pinataHash } = accessEntry;

        // Fetch the file from the provided Pinata IPFS link
        const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`, { responseType: 'arraybuffer' });

        const contentType = response.headers['content-type'];

        // Check content type and handle accordingly (PDF, HTML, or Images)
        if (contentType.includes('text/html')) {
            const html = response.data;
            const $ = cheerio.load(html);
            let pdfLinkText = null;

            // Search for PDF links in the HTML
            $('a').each((index, element) => {
                const link = $(element).attr('href');
                if (link && link.endsWith('.pdf')) {
                    pdfLinkText = $(element).text();
                    return false;  // Stop after finding the first match
                }
            });

            console.log(pdfLinkText);

            // If a PDF link is found, fetch the PDF data
            if (pdfLinkText) {
                const pdfData = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}/${pdfLinkText}`, { responseType: 'arraybuffer' });
                res.set('Content-Type', 'application/pdf');
                res.send(pdfData?.data);
            }
        } else if (contentType.includes('application/pdf')) {
            // Send the PDF content
            console.log("PDF file detected");
            res.set('Content-Type', 'application/pdf');
            res.send(response.data);

        } else if (contentType.includes('image/png') || contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
            // Send the image content with correct content type
            console.log("Image file detected", contentType);
            const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`, { responseType: 'arraybuffer' });

            // Set proper headers for image
            res.set({
                'Content-Type': contentType,
                'Content-Disposition': 'inline' // 'inline' allows the image to be displayed in the browser
            });

            res.send(Buffer.from(response.data, 'binary')); // Ensure binary data is sent properly
        } else {
            // Default case: Handle other content types if necessary
            console.log("Unsupported content type", contentType);
            res.status(415).send({
                success: false,
                message: "Unsupported content type"
            });
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while getting user data",
            error
        });
    }
};



// Remove Access Record by updating userIds array
export const removeAccess = async (req, res) => {
    try {
        const { email, pinataHash, newUserId } = req.body;

        const updatedUser = await accessRecord.findOneAndUpdate(
            { email, "accessData.pinataHash": pinataHash },
            {
                $set: {
                    "accessData.$.userId": newUserId, // Update the userId for the matching pinataHash
                    "accessData.$.accessFlag": false // Set accessFlag to false to revoke access
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: "User or record not found"
            });
        }

        res.status(201).send({
            success: true,
            message: "Access removed successfully",
            updatedUser
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while removing access",
            error
        });
    }
};


// Delete User (if the user has multiple entries, delete the entire document)
export const deleteUser = async (req, res) => {
    try {
        const { email } = req.body;

        const deletedUser = await accessRecord.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        res.status(201).send({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while deleting user",
            error
        });
    }
};


// Get Record by Pinata Hash (CID)
export const getRecordByURI = async (req, res) => {
    try {
        const { pinataHash } = req.params;
        const record = await accessRecord.find({
            accessData: {
                $elemMatch: {
                    pinataHash: pinataHash,
                    accessFlag: true
                }
            }
        }
        );

        if (!record || record.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Record not found or access is revoked"
            });
        }

        res.status(201).send({
            success: true,
            message: "Records retrieved",
            record
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while accessing record by URI",
            error
        });
    }
};

// Get Document by Pinata Hash (CID)
export const getDocByUri = async (req, res) => {
    try {
        const { pinataHash } = req.params;

        // Fetch the file from the provided Pinata IPFS link
        const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`, { responseType: 'arraybuffer' });

        const contentType = response.headers['content-type'];

        // Check content type and handle accordingly (PDF, HTML, or Images)
        if (contentType.includes('text/html')) {
            const html = response.data;
            const $ = cheerio.load(html);
            let pdfLinkText = null;

            // Search for PDF links in the HTML
            $('a').each((index, element) => {
                const link = $(element).attr('href');
                if (link && link.endsWith('.pdf')) {
                    pdfLinkText = $(element).text();
                    return false;  // Stop after finding the first match
                }
            });

            console.log(pdfLinkText);

            // If a PDF link is found, fetch the PDF data
            if (pdfLinkText) {
                const pdfData = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}/${pdfLinkText}`, { responseType: 'arraybuffer' });
                res.set('Content-Type', 'application/pdf');
                res.send(pdfData?.data);
            }
        } else if (contentType.includes('application/pdf')) {
            // Send the PDF content
            console.log("PDF file detected");
            res.set('Content-Type', 'application/pdf');
            res.send(response.data);

        } else if (contentType.includes('image/png') || contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
            const response = await axios.get(`https://red-traditional-hookworm-447.mypinata.cloud/ipfs/${pinataHash}`, { responseType: 'arraybuffer' });

            res.set({
                'Content-Type': contentType,
                'Content-Disposition': 'inline' // 'inline' allows the image to be displayed in the browser
            });

            res.send(Buffer.from(response.data, 'binary')); 
        } else {
            // Default case: Handle other content types if necessary
            console.log("Unsupported content type", contentType);
            res.status(415).send({
                success: false,
                message: "Unsupported content type"
            });
        }

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error while getting user data",
            error
        });
    }
};

