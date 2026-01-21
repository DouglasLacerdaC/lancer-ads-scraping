import { olxService } from "../services/olx.js";
import { discordService } from "../services/discord.js"
import { delay } from "../shared/utils/delay.js";
import { getJSON, setJSON } from "../services/json.js";

import cron from "node-cron"
import { webmotorsService } from "../services/webmotors.js";

export async function updateNewAds() {
  try {
    const currentDataJson = await getJSON()

    const olxAds = await olxService.getAds()
    const webmotorsAds = await webmotorsService.getAds()

    const newData = [...olxAds, ...webmotorsAds].filter(ad => {
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
  } catch (error) {
    console.log(`\n❌ [Erro] Não foi possível finalizar a busca dos anúncios. Erro: ${error}\n`)
  }
}

export const registerJobs = () => {

  cron.schedule("0 */10 * * * *", () => { // Cada 10min
    updateNewAds()
  })
}