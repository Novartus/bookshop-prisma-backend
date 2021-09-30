import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { includes, map } from 'lodash';
import { Profile, User, UserCard } from '.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'src/utils/Stripe';
import {
  AddCardDto,
  DeleteCardDto,
  MakeDefaultCardDto,
  UpdateCardDto,
} from 'src/dto/payment.dto';
import { UpdateProfileDto } from 'src/dto/user.dto';
import { GlobalResponseType, ResponseMap } from 'src/utils/type';
import { StripeCardDetails } from 'src/utils/interface';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async viewMyProfile(user: User): GlobalResponseType {
    try {
      const myProfile = await this.prisma.profile.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
        },
        select: {
          id: true,
          bio: true,
          address: true,
          city: true,
          country: true,
          phone: true,
        },
      });

      if (!myProfile) {
        throw new BadRequestException('Profile not found!');
      }

      return ResponseMap(
        {
          profile: myProfile,
        },
        'Profile successfully found',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(
    user: User,
    updateProfileDto: UpdateProfileDto,
  ): GlobalResponseType {
    try {
      let updatedProfile: Profile = null;

      const hasProfile = await this.prisma.profile.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      if (hasProfile) {
        updatedProfile = await this.prisma.profile.update({
          where: { id: hasProfile.id },
          data: {
            bio: updateProfileDto.bio,
            phone: updateProfileDto.phone,
            address: updateProfileDto.address,
            city: updateProfileDto.city,
            country: updateProfileDto.country,
          },
        });
      } else {
        updatedProfile = await this.prisma.profile.create({
          data: {
            userId: user.id,
            bio: updateProfileDto.bio,
            phone: updateProfileDto.phone,
            address: updateProfileDto.address,
            city: updateProfileDto.city,
            country: updateProfileDto.country,
          },
        });

        const stripeCustomer = await Stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id,
          },
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            stripeCustomerId: stripeCustomer.id,
          },
        });
      }

      return ResponseMap(
        {
          profile: updatedProfile,
        },
        'Profile Updated Successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addCard(user: User, addCardDto: AddCardDto): GlobalResponseType {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      });

      if (!userData.stripeCustomerId) {
        throw new BadRequestException('User has no stripe customer id');
      }

      const cardToken = await Stripe.tokens.create({
        card: {
          name: addCardDto.cardName,
          number: addCardDto.cardNumber,
          exp_month: addCardDto.cardExpiryMonth.toString(),
          exp_year: addCardDto.cardExpiryYear.toString(),
          cvc: addCardDto.cardCvc.toString(),
        },
      });

      const allUserCards = await Stripe.customers.listSources(
        userData.stripeCustomerId,
        {
          object: 'card',
        },
      );

      let allCards: any = [];
      allCards = allUserCards.data;
      const allFingerPrints = map(allCards, (data) => {
        return data.fingerprint;
      });

      const existingCard = includes(
        allFingerPrints,
        cardToken.card.fingerprint,
      );

      if (existingCard) {
        throw new BadRequestException('Card already exists');
      }

      const card = await Stripe.customers.createSource(
        userData.stripeCustomerId,
        {
          source: cardToken.id,
        },
      );

      const newCard = await this.prisma.userCard.create({
        data: {
          userId: user.id,
          cardId: card.id,
        },
      });

      return ResponseMap(
        {
          card: newCard,
        },
        'New card added successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async viewCard(user: User): GlobalResponseType {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      });

      if (!userData.stripeCustomerId) {
        throw new BadRequestException('User has no stripe customer id');
      }

      const cards = await this.prisma.userCard.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
        },
      });

      const stripeCustomer = await Stripe.customers.retrieve(
        userData.stripeCustomerId,
      );

      // @ts-ignore : Stripe Ignore
      const defaultSource = stripeCustomer.default_source;

      const userCardData: Array<StripeCardDetails> = [];

      for (let i = 0; i < cards.length; i++) {
        try {
          const cardData = await Stripe.customers.retrieveSource(
            userData.stripeCustomerId,
            cards[i].cardId,
          );
          const stripeCardObj = {
            // @ts-ignore : Stripe Ignore
            cardName: cardData.name,
            cardId: cards[i].cardId,
            // @ts-ignore : Stripe Ignore
            cardExpiryMonth: cardData.exp_month,
            // @ts-ignore : Stripe Ignore
            cardExpiryYear: cardData.exp_year,
            // @ts-ignore : Stripe Ignore
            cardLast4: cardData.last4,
            // @ts-ignore : Stripe Ignore
            cardBrand: cardData.brand,
            cardDefault: defaultSource === cards[i].cardId ? true : false,
          };
          userCardData.push(stripeCardObj);
        } catch (error) {
          throw new HttpException(
            error,
            error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      return ResponseMap(
        {
          cards: userCardData,
          totalCards: userCardData.length,
        },
        'Cards fetched successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateCard(
    user: User,
    updateCardDto: UpdateCardDto,
  ): GlobalResponseType {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      });

      if (!userData.stripeCustomerId) {
        throw new BadRequestException('User has no stripe customer id');
      }

      const card = await this.prisma.userCard.findFirst({
        where: {
          cardId: updateCardDto.cardId,
          deletedAt: null,
        },
      });

      if (!card) {
        throw new BadRequestException('No existing card found to delete');
      }

      await Stripe.customers.updateSource(
        userData.stripeCustomerId,
        card.cardId,
        {
          name: updateCardDto.cardName,
          exp_month: updateCardDto.cardExpiryMonth.toString(),
          exp_year: updateCardDto.cardExpiryYear.toString(),
        },
      );

      return ResponseMap(
        {
          updatedCard: card,
        },
        'Card updated successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCard(
    user: User,
    deleteCardDto: DeleteCardDto,
  ): GlobalResponseType {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      });

      if (!userData.stripeCustomerId) {
        throw new BadRequestException('User has no stripe customer id');
      }

      const card = await this.prisma.userCard.findFirst({
        where: {
          cardId: deleteCardDto.cardId,
          deletedAt: null,
        },
      });

      if (!card) {
        throw new BadRequestException('No existing card found to delete');
      }

      const stripeDeleteCard = await Stripe.customers.deleteSource(
        userData.stripeCustomerId,
        card.cardId,
      );
      let deletedCard: UserCard = null;

      // @ts-ignore : Stripe Ignore
      if (stripeDeleteCard.deleted) {
        deletedCard = await this.prisma.userCard.update({
          where: { id: card.id },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      return ResponseMap(
        {
          deletedCard: deletedCard,
          deleted: deletedCard.deletedAt ? true : false,
        },
        'Card updated successfully',
      );
    } catch (error) {
      throw new HttpException(
        error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async makeDefaultCard(
    user: User,
    makeDefaultCardDto: MakeDefaultCardDto,
  ): GlobalResponseType {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!userData.stripeCustomerId) {
        throw new BadGatewayException('No Stripe ID found');
      }

      const userCard = await this.prisma.userCard.findFirst({
        where: {
          cardId: makeDefaultCardDto.cardId,
          deletedAt: null,
        },
      });

      if (!userCard) {
        throw new BadRequestException('No card found to make default');
      }

      await Stripe.customers.update(userData.stripeCustomerId, {
        default_source: makeDefaultCardDto.cardId,
      });

      return ResponseMap(
        {
          default: true,
        },
        'Successfully updated default card',
      );
    } catch (err) {
      throw new HttpException(
        err,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
