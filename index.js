const axios = require('axios')
const { json2csv } = require('json-2-csv');
const fs = require('fs')

const chapterPath = 'https://web-api.qurankemenag.net/quran-surah'
const versePath = 'https://web-api.qurankemenag.net/quran-ayah'

async function generateChapters() {
  const res = await axios.get(chapterPath, {
    headers: {
      'Origin': 'https://quran.kemenag.go.id'
    }
  })

  const csv = await json2csv(res.data.data, { excludeKeys: ['updated_at'] })

  if (!fs.existsSync('output')) {
    await fs.promises.mkdir('output')
  }

  await fs.promises.writeFile('output/chapters.csv', csv)
}

async function generateVerses() {
  const chapters = Array.from({ length: 114 }, (_, i) => i + 1)

  for (const chapter of chapters) {
    const res = await axios.get(versePath, {
      headers: {
        'Origin': 'https://quran.kemenag.go.id'
      },
      params: {
        surah: chapter
      }
    })

    if (chapter === 1) {
      await fs.promises.rm('output/verses.csv')
    }

    const csv = await json2csv(res.data.data, {
      prependHeader: chapter === 1,
      excludeKeys: ['surah', 'updated_at']
    })

    if (!fs.existsSync('output')) {
      await fs.promises.mkdir('output')
    }

    await fs.promises.appendFile('output/verses.csv', csv + '\n')
  }
}

generateChapters()
generateVerses()
