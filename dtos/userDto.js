export class UserDto {
	email;
	id;
	isActivated;

	constructor(model) {
		this.email = model.email;
		this.id = model.__id;
		this.isActivated = model.isActivated;
	}
}