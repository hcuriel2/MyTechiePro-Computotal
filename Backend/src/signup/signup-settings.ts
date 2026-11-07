import mongoose = require('mongoose');
export interface SignupSettings { clientEnabled: boolean; professionalEnabled: boolean; clientNotice: string; professionalNotice: string; }
export const defaults: SignupSettings = { clientEnabled: true, professionalEnabled: true, clientNotice: 'Client signups are temporarily closed. Please check back soon.', professionalNotice: 'Professional signups are temporarily closed. Please check back soon.' };
const schema = new mongoose.Schema({
    _id: { type: String },
    clientEnabled: { type: Boolean, default: true }, professionalEnabled: { type: Boolean, default: true },
    clientNotice: { type: String, default: defaults.clientNotice, maxlength: 1000 },
    professionalNotice: { type: String, default: defaults.professionalNotice, maxlength: 1000 }
}, { timestamps: true });
const model = mongoose.model('SignupSettings', schema);
export interface SettingsStore { read(): Promise<SignupSettings>; write(value: SignupSettings): Promise<SignupSettings>; }
function publicSettings(value: any): SignupSettings {
    return { clientEnabled: value.clientEnabled, professionalEnabled: value.professionalEnabled, clientNotice: value.clientNotice, professionalNotice: value.professionalNotice };
}
export const mongoSettingsStore: SettingsStore = {
    async read() {
        const value = await model.findById('signup').lean();
        return value ? publicSettings(value) : { ...defaults };
    },
    async write(value) {
        const saved = await model.findOneAndUpdate({ _id: 'signup' }, { $set: value }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
        return publicSettings(saved);
    }
};
export function validSettings(value: any): value is SignupSettings {
    const keys = Object.keys(defaults);
    return value && typeof value === 'object' && Object.keys(value).length === keys.length &&
        keys.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
        typeof value.clientEnabled === 'boolean' && typeof value.professionalEnabled === 'boolean' &&
        ['clientNotice', 'professionalNotice'].every(key => typeof value[key] === 'string' && value[key].trim().length > 0 && value[key].length <= 1000);
}
