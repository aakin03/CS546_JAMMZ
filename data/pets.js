const mongoCollections = require("../config/mongoCollections");
const uuidV4 = require('uuid/v4');
const pets = mongoCollections.pets;

let exportedMethods = {
    addPet(petName, ownerName, breed, age, color, weight, cost, status, extraInfo) {
		if (!petName)
			return Promise.reject("You must supply a pet name.");
		if (!ownerName)
			return Promise.reject("You must supply an owner name.");
		
		let uuid = uuidV4();
		return pets().then((petCollection) => {
			let newPet = {
				_id: uuid,
				petName: petName,
				ownerName: ownerName,
				attributes: {
					Breed: breed,
					Age: age,
					Color: color,
					Weight: weight
				},
				cost: cost,
				status: status,
				extraInfo: extraInfo
			}
			
			return petCollection
			.insertOne(newPet)
			.then((newInsertInformation) => {
				return newInsertInformation.insertedId;
			})
			.then((newId) => {
				return this.getPet(newId)
			});
		});
	},
	getUsersPets(name) {
		if (!name)
			return Promise.reject("You must provide a user's name to search for a pet!");
		return pets().then((petCollection) => {
			return petCollection.find({ownerName: name}).toArray();
		})
		.then((result) => {
			if (result === null) {
				return Promise.reject("No ${name} was found.");
			}
			else {
				return result;
			}
		})
	},

   
    getOnePet(petName, userName) {
		if (!petName)
			return Promise.reject("You must provide a pet's name to search for a pet!");
		return pets().then((petCollection) => {
			return petCollection.find({petName: petName, ownerName: userName}).toArray();
		})
		.then((result) => {
			if (result === null) {
				return Promise.reject("${petName} was not found.");
			}
			else {
				return result;
			}
		})
	},
	
    removePet(id) {
        return pets().then((petCollection) => {
            return petCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw (`Could not delete pet with id of ${id}`)
                }
            });
        });
    },
	
    updatePet(oldPet, updatedPet, userName) {
        return pets().then((petCollection) => {
            let pName, oName, pCost, pStatus, pBreed, pAge, pColor, pWeight, pInfo;
            
            if (updatedPet.newpetName)
                pName = updatedPet.newpetName;
            else
                pName = updatedPet.petName;
            
            if (updatedPet.ownerName)
                oName = updatedPet.ownerName;
            else
                oName = oldPet.ownerName;
            
            if (updatedPet.cost)
                pCost = updatedPet.cost;
            else
                pCost = oldPet.cost;
			
            if (updatedPet.status)
                pStatus = updatedPet.status;
            else
                pStatus = oldPet.status;
                        
            if (updatedPet.breed)
                pBreed = updatedPet.breed;
            else
                pBreed = oldPet.attributes.Breed;
            
            if (updatedPet.age)
                pAge = updatedPet.age;
            else
                pAge = oldPet.attributes.Age;
            
            if (updatedPet.color)
                pColor = updatedPet.color;
            else
                pColor = oldPet.attributes.Color;
            
            if (updatedPet.weight)
                pWeight = updatedPet.weight;
            else
                pWeight = oldPet.attributes.Weight;
            
            if (updatedPet.info)
                pInfo = updatedPet.info; 
            else
                pInfo = oldPet.extraInfo;
            
            let updatedPetData = {
				_id: oldPet._id,
				petName: pName,
				ownerName: oName,
				attributes: {
					Breed: pBreed,
					Age: pAge,
					Color: pColor,
					Weight: pWeight
				},
				cost: pCost,
				status: pStatus,
				extraInfo: pInfo
			}
            
            let updateCommand = {
                $set: updatedPetData
            };
            
            return petCollection.updateOne({_id: oldPet._id, ownerName: userName}, updateCommand).then((result) => {
                return this.getOnePet(petName, userName).then((result) => {
                    return result;
                });
            });
        });
    },
		

	viewAllPets() {
		return pets().then((petCollection) => {
			return petCollection.find({}).toArray();
		});
	},
	
	viewAllPetsByStatus() {
		return pets().then((petCollection) => {
			return petCollection.find({status: "Available"}).toArray();
		});
	}
	//deletePet
};

module.exports = exportedMethods;