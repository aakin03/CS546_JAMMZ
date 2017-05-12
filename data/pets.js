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
	
    updatePet(petID, updatedPet, userName) {
        return pets().then((petCollection) => {
            let updatedPetData = {};
            
            console.log("UpdatePet");
            console.log(petID);
            console.log("Updated Info");
            console.log(updatedPet);

            if (updatedPet.petName) {
                console.log("Pet Name:");
                console.log(updatedPet.petName);
                updatedPetData.petName = updatedPet.petName;
            }
            if (updatedPet.ownerName) {
                console.log("Owner Name:");
                console.log(updatedPet.ownerName);
                updatedPetData.title = updatedPet.ownerName;
            }
            if (updatedPet.cost) {
                console.log("Cost:");
                console.log(updatedPet.cost);
                updatedPetData.cost = updatedPet.cost;
            }
			if (updatedPet.status) {
                console.log("Status:");
                console.log(updatedPet.status);
                updatedPetData.status = updatedPet.status;
            }
            if (updatedPet.breed) {
                console.log("Breed:");
                console.log(updatedPet.breed);
                updatedPetData.breed = updatedPet.breed;
            }
            if (updatedPet.age) {
                console.log("Age:");
                console.log(updatedPet.age);
                updatedPetData.age = updatedPet.age;
            }
            if (updatedPet.color) {
                console.log("Color:");
                console.log(updatedPet.color);
                updatedPetData.color = updatedPet.color;
            }
            if (updatedPet.weight) {
                console.log("Weight:");
                console.log(updatedPet.weight);
                updatedPetData.weight = updatedPet.weight;
            }
            if (updatedPet.info) {
                console.log("Pet Info:");
                console.log(updatedPet.info);
                updatedPetData.info = updatedPet.info; 
            }
            
            let updateCommand = {
                $set: updatedPetData
            };
            
            console.log("Update Command");
            console.log(updatedPetData);
            
            return petCollection.updateOne({_id: petID}, updateCommand).then((result) => {
                console.log(result);
                return this.getOnePet(petName, userName);
            });
        });
    },

	viewAllPets() {
		return pets().then((petCollection) => {
			return petCollection.find({}).toArray();
		});
	}
	//deletePet
};

module.exports = exportedMethods;