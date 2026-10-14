import { createHubsZSchema } from "../../src/models/hubs";

const validHub = {
    "roomNumber": 1,
    "capacity": "3-5",
    "equipment": ["Cable", "Projector"]
}

describe('Test Hub Validation', () => {
    it('should pass for the following valid data', () => {
        expect(() => createHubsZSchema.parse(
            validHub)).not.toThrow();
    });
    
    it('should fail for a missing roomNumber', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "roomNumber": undefined })).toThrow();
    });
    
    it('should fail for the Room Number bigger than 4', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "roomNumber": 11 })).toThrow();
    });
    
    it('should fail for the Room Number less than 1', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "roomNumber": 0 })).toThrow();
    });

    it('should fail for an empty roomNumber ', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "roomNumber": '' })).toThrow();
    });
   
    it('should fail for the missing capacity ', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "capacity": undefined })).toThrow();
    });   

    it('should fail for an empty capacity', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "capacity": '' })).toThrow();
    });

    it('should fail for the unparsaable equipment ', () => {
        expect(() => createHubsZSchema.parse(
            { ...validHub, "equipment": 'equipment not avaliable' })).toThrow();
    });

});
