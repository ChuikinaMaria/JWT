import { userModel } from '../models/userModel.js';
import bcryptjs from 'bcryptjs';
import { v4 } from 'uuid';
import { mailService } from './mailService.js';
import { tokenService } from './tokenService.js'
import { UserDto } from '../dtos/userDto.js';
import { ApiError } from '../exceptions/apiError.js';

class UserService {
	async registration(email, password) {
		const candidate = await userModel.findOne({email});
		if (candidate) {
			throw ApiError.BadRequest(`User ${email} already exists`);
		}
		const hashPass = await bcryptjs.hash(password, 3);
		const activationLink = v4();
		const user = await userModel.create({email, password: hashPass, activationLink});
		await mailService.sendActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);
		console.log(`!!!!!!!!!!!--${process.env.API_URL}/activate/${activationLink}-----!!!!!!!!!!`)

		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({...UserDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return {...tokens, user: userDto}

	}

	async activate(activationLink){
		const user = await userModel.findOne({activationLink});
		if (!user) {
			throw ApiError.BadRequest('invalid activation link')
		}
		user.isActivated=true;
		await user.save();
	}

	async login(email, password) {
		const user = await userModel.findOne({email});
		if (!user) {
			throw ApiError.BadRequest('User not found');
		}
		const isPassEquals = await bcryptjs.compare(password, user.password);
		if(!isPassEquals) {
			throw ApiError.BadRequest('Wrong password')
		}
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({...userDto});
		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		
		return {...tokens, user: userDto}

	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken) {
		if(!refreshToken) {
			throw ApiError.UnauthorizedError();
		}
		const userData = tokenService.validateRefreshToken(refreshToken);
	}
}

export const userService = new UserService();