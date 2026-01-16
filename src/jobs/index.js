import { olxService } from "../services/olx.js";
import { discordService } from "../services/discord.js"
import { delay } from "../shared/utils/delay.js";
import { getJSON, setJSON } from "../services/json.js";

import cron from "node-cron"

async function updateNewAds() {
  const currentDataJson = await getJSON()

  const olxAds = await olxService.getAds()

  const newData = olxAds.filter(ad => {
    const isValid = currentDataJson.find(data => data.link == ad.link)

    if (!isValid) return ad
  })

  for (const newAd of newData) {
    try {
      await discordService.sendAD(newAd);
      await delay(2000)
    } catch (error) {
      console.warn("❌ Não foi possível enviar o anúncio: ", error);
    }
  }

  console.warn(`\n🚀 [${newData.length}] novos anúncios encontrados\n`)

  setJSON([...currentDataJson, ...newData])
}

export const registerJobs = () => {

  cron.schedule("0 */5 * * * *", () => { // Cada 1min
    updateNewAds()
  })
}