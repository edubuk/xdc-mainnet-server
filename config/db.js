import mongoose  from 'mongoose';


const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.mongoDB_URL}`)
        console.log('Connected to MongoDB database');
    } catch (error) {
        console.log('Error in mongoDB' );
    }
}

export default connectDB;