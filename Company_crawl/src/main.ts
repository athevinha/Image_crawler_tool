import opengovuk from "./1_opengovuk/main.js"
import servicegovuk from "./2_servicegovuk/main.js"
import randomaddress from "./3_randomaddress/main.js"
import fs from "fs"
import path from "path";
import { stringify } from "csv-stringify"
import ExcelJS from 'exceljs';
// const nass_dir = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\EAA-LOWCONTENT\\Coloring Pages\\Just color\\"
const nass_dir = "";
const _ = "\\";


(async () => {
  // const opengovuk_data = await opengovuk();
  // const servicegovuk_data = await servicegovuk();
  const randomaddress_data = await randomaddress()
})();
