import { HubModel, IHub } from '../models/hubs';
import { HydratedDocument } from 'mongoose';

//#region ChatGPT -código price filter develop by ChatGPT.
const prices: Record<IHub['capacity'], number> = {
  '1-2': 100,
  '3-5': 250,
  '6-10': 5000,
};
//#endregion

export class HubService {

  async getAllHubs(): Promise<IHub[]> {
    return await HubModel.find().lean();
  }

  async getHubById(id: string): Promise<IHub | null> {
    return await HubModel.findById(id).lean();
  }

  async createHub(hubData: IHub): Promise<HydratedDocument<IHub>> {
    const hub = new HubModel({
      ...hubData,
      price: prices[hubData.capacity]
    });
    return await hub.save();
  }

  async updateHub(id: string, hubData: Partial<IHub>): Promise<IHub | null> {
    const updateData = { ...hubData };
    
    //Price is calculated by the service
    //#region ChatGPT -código price filter develop by ChatGPT.
    delete updateData.price;
    
    if (hubData.capacity !== undefined) {
      updateData.price = prices[hubData.capacity];
    }
    //#endregion

    return await HubModel.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after', runValidators: true
    })
      .lean();
  }

  async deleteHub(id: string): Promise<IHub | null> {
    return await HubModel.findByIdAndDelete(id).lean();
  }
}