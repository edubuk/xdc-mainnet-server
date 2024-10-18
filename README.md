# Solana-Radar-Hackathon (Sept. - Oct. 2024)
## Backend code of Edubuk's dApp integrated with Solana Blockchain (Devnet)

**1. Backend Functionality**
Overview: This backend code provides APIs for managing and accessing digital credentials using IPFS and a MongoDB database. It supports sharing access, verifying credentials, removing access, deleting users, and retrieving files from IPFS.

**Key Libraries Used:**
axios: Used for making HTTP requests to the Pinata IPFS service.
cheerio: Used to parse and manipulate HTML content retrieved from IPFS.
mongoose: Used to interact with MongoDB for storing and managing access records.

**2. API Endpoints**

1. shareAccess

Method: POST
Description: Shares access to a digital credential. If the user already has access to the specified certificate (pinataHash), it updates the user ID and sets the access flag to true. Otherwise, it adds a new access entry.
Parameters:
email: The email address of the user.
name: Name of the user.
userId: Unique identifier for the user.
pinataHash: The IPFS hash of the certificate.
Response: Creates or updates the access record in the database.

2. getUser
Method: GET
Description: Retrieves a user's access record by their user ID. It fetches the file from the IPFS if the access flag is set to true.
Parameters:
userId: User ID to identify the access record.
Response: Returns the user's certificate if access is granted and the file exists.

3. removeAccess
Method: PUT
Description: Removes access to a specific certificate by updating the accessFlag to false and changing the userId.
Parameters:
email: Email of the user whose access is being revoked.
pinataHash: The IPFS hash of the certificate.
newUserId: New user ID to be set.
Response: Updates the access record in the database.

4. deleteUser
Method: DELETE
Description: Deletes a user's access record entirely from the database.
Parameters:
email: Email of the user to be deleted.
Response: Deletes the user's record from the database.

5. getRecordByURI
Method: GET
Description: Retrieves access records associated with a specific IPFS hash (pinataHash). Only records with an active accessFlag are returned.
Parameters:
pinataHash: The IPFS hash of the certificate.
Response: Returns the access record if it exists and access is granted.

6. getDocByUri
Method: GET
Description: Fetches a document from IPFS using the provided pinataHash. It supports various content types (HTML, PDF, images) and sends them as a response.
Parameters:
pinataHash: The IPFS hash of the document.
Response: Returns the document content based on its type.

**3. Prerequisites**
Node.js installed on the machine.
MongoDB set up and running.
An account on Pinata to store files on IPFS.

**4. Environment Variables**
Add the following environment variables in a .env file:

MONGODB_URI: URI to connect to MongoDB.
PINATA_API_KEY and PINATA_API_SECRET: Pinata API keys for IPFS access.

**There are 4 stakeholders as mentioned in the diagram below:**

1.) Issuer: University or Employer who issues the academic certificate or Work-Experience certificate.

2.) Holder: Student or Employee with whom this certificate resides.

3.) Verifier: Other Universities or Other Employers who directly wish to check the authenticity of the credential of the student on the blockchain. 

4.) Requestor: Third party background verification companies: These companies request the candidate to share their digitally verified certificate stored on the blockchain with them for verification purposes.

![image](https://github.com/user-attachments/assets/60901a8b-143c-41e6-947c-aa77b627f4cb)


**This project includes a decentralized application (dApp) for recording and verifying certificates on the Solana blockchain. The dApp has two main components:**

**1. e-Sealing**

The e-Sealing Tab allows users to register certificates on the blockchain by signing the transaction using a Web3 wallet. When registering a certificate:
Metadata Fields: Users provide three metadata fields:
Certificate Issued To: The beneficiary of the certificate.
Certificate Issued By: The issuing authority.
Certificate Type: Description of the certificate.
Upload Certificate: Users upload a digital copy of the certificate from their local computer.
Register File Hash: Clicking "Register File Hash" generates a cryptographic hash of the file and creates a transaction on the blockchain. This process records six fields:
Beneficiary
Certifying Authority
Certificate Details
Unique file hash (cryptographic)
Timestamp (when the certificate was recorded in UTC)
Witness (certifying authority's wallet address)

**2. Verification**
The Verification Tab allows users to upload a digital certificate and click "Verify Certificate." The dApp retrieves the six fields from the blockchain to verify the information. If all fields match, it displays a "Certificate Verified" message. If the certificate has been tampered with or was not registered on the chain, it shows "Error! Certificate Not Verified."

**Key Components and Functionality**

**Program Declaration**
declare_id!: Sets the unique program ID for this smart contract on the Solana network.

**Main Program Module**
#[program] pub mod edubuk_eseal_solana: Defines the main module for managing digital seals in this contract, indicating the functionality provided by Edubuk's e-Seal solution.

**Core Functionality**
add_certificate_record: This function allows authorized users to add new certificate records to the blockchain. It requires parameters such as the issuer, recipient, certificate type, and file hash, along with a timestamp. Before adding a new record, the function checks if it has already been initialized to prevent overwriting. If not, it stores the record using the provided data.

**Accounts Structure**
#[derive(Accounts)] pub struct AddCertificateRecord: Defines the accounts required for the add_certificate_record function. It uses the #[account] attribute to set up account requirements, including:
Certificate Record Account: Marked to be initialized within the function call. It generates a unique address using a static string "certificate," the initializer's public key, and the file hash.
Initializer Account: The account that authorizes the transaction and pays for it.
System Program: A reference to the Solana System Program used for account creation and management.

**Certificate Account State**
#[account] pub struct CertificateAccountState: Represents the state of a certificate stored on the blockchain, including the issuer, recipient, certificate type, file hash, timestamp, and witness (public key of the initializer). It includes an "initialized" flag to indicate whether the record has been set up.

**Error Handling**
#[error_code] pub enum ErrorCode: Defines custom error codes for the contract. For instance, RecordAlreadyInitialized prevents overwriting an already initialized certificate.
Security and Best Practices
Authorization Checks: Ensures only authorized signers (initializers) can add new certificate records to prevent unauthorized access.
Data Consistency: Checks the "initialized" flag before adding a record to avoid accidental overwrites.
Efficient Resource Use: Dynamically calculates account space requirements for optimized blockchain storage.
dApp Overview

**Use Cases**
This smart contract and dApp cater to various applications requiring immutable and verifiable records of certification, such as:

**Educational Credentials
Professional Licenses
Authenticity Certificates for Digital or Physical Assets**

Edubuk makes credentials verification and background checks secure, efficient, cost-effective, and fraud-free using AI & Blockchain Technology. Since launch, Edubuk has recorded 20,000+ certificates on the blockchain, has secured partnerships with 15 universities and third party background verification companies.  Globally recognized with 40+ awards on merit, including Best Edtech Startup in G20 Conference, and media recognition from CNBC, CNN, Forbes, Economic Times and Grants from major Blockchains, Edubuk has build on Solana chain now as we prepare to Launch as a part of Singapore based Tenity's accelerator program. We are setting new standards in the credentials & background verification industry, globally.
