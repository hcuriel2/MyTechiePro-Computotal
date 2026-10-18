import mongoose, { Schema, Document } from 'mongoose';
import AboutUs from './aboutus.interface';

const AboutUsSchema: Schema = new Schema({
    content: { type: String, required: true, default: '' },
    appendixContent: { type: String, default: '' },
});

export default mongoose.model<AboutUs & Document>('AboutUs', AboutUsSchema);