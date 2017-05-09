const mongoCollections = require("../config/mongoCollections");
const uuidV4 = require('uuid/v4');
const pets = mongoCollections.pets;

let exportedMethods = {
    addPet(petName, ownerName, attributes, cost, status, extraInfo) {
		if (!petName)
			return Promise.reject("You must supply a pet name.");
		if (!ownerName)
			return Promise.reject("You must supply an owner name.");
		
		let uuid = uuidV4()
		
		return pets().then((petCollection) => {
			let newPet = {
				_id: uuid,
				petName: petName,
				ownerName: ownerName,
				attributes: {
					breed: null,
					age: null,
					color: null,
					weight: null
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
	getPet(id) {
		if (!id)
			return Promise.reject("You must provide an id to search for a pet!");
		return pets().then((petCollection) => {
			return petCollection.findOne({ _id: id });
		})
		then((result) => {
			if (result === null) {
				return Promise.reject(`No pet with id ${id} was found.`);
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
	
    updatePet(id, updatedPet) {
        return pets().then((petCollection) => {
            let updatedPetData = {};

            if (updatedPet.petName) {
                updatedPetData.petName = updatedPet.petName;
            }

            if (updatedPet.ownerName) {
                updatedPetData.title = updatedPet.ownerName;
            }

            if (updatedPet.cost) {
                updatedPetData.cost = updatedPet.cost;
            }
			if (updatedPet.status) {
                updatedPetData.status = updatedPet.status;
            }

            let updateCommand = {
                $set: updatedPetData
            };

            return petCollection.updateOne({ _id: id }, updateCommand).then((result) => {
                return this.getPetById(id);
            });
        });
    },

	//deletePet
};

module.exports = exportedMethods;