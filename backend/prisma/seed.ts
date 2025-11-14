import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * ✅ ESSENTIAL SEED: Geography (Türkiye)
 *
 * 81 İl ve 973 İlçe verisi.
 * Adres yönetimi için zorunlu.
 */

// Türkiye İl ve İlçe verileri (Güncel 2024-2025)
const TURKEY_GEOGRAPHY_DATA = [
  {
    name: 'ADANA',
    plateCode: '01',
    districts: [
      'ALADAĞ', 'CEYHAN', 'ÇUKUROVA', 'FEKE', 'İMAMOĞLU', 'KARAİSALI',
      'KARATAŞ', 'KOZAN', 'POZANTI', 'SAİMBEYLİ', 'SARIÇAM', 'SEYHAN',
      'TUFANBEYLİ', 'YUMURTALIK', 'YÜREĞİR'
    ]
  },
  {
    name: 'ADIYAMAN',
    plateCode: '02',
    districts: [
      'BESNİ', 'ÇELİKHAN', 'GERGER', 'GÖLBAŞI', 'KAHTA', 'MERKEZ',
      'SAMSAT', 'SİNCİK', 'TUT'
    ]
  },
  {
    name: 'AFYONKARAHİSAR',
    plateCode: '03',
    districts: [
      'BAŞMAKÇI', 'BAYAT', 'BOLVADİN', 'ÇAY', 'ÇOBANLAR', 'DAZKIRI',
      'DİNAR', 'EMİRDAĞ', 'EVCİLER', 'HOCALAR', 'İHSANİYE', 'İSCEHİSAR',
      'KIZILÖREN', 'MERKEZ', 'SANDIKLI', 'SİNANPAŞA', 'SULTANDAĞI', 'ŞUHUT'
    ]
  },
  {
    name: 'AĞRI',
    plateCode: '04',
    districts: [
      'DİYADİN', 'DOĞUBAYAZIT', 'ELEŞKİRT', 'HAMUR', 'MERKEZ',
      'PATNOS', 'TAŞLIÇAY', 'TUTAK'
    ]
  },
  {
    name: 'AMASYA',
    plateCode: '05',
    districts: [
      'GÖYNÜÇEK', 'GÜMÜŞHACIKÖY', 'HAMAMÖZÜ', 'MERKEZ', 'MERZİFON',
      'SULUOVA', 'TAŞOVA'
    ]
  },
  {
    name: 'ANKARA',
    plateCode: '06',
    districts: [
      'AKYURT', 'ALTINDAĞ', 'AYAŞ', 'BALA', 'BEYPAZARI', 'ÇAMLIDERE',
      'ÇANKAYA', 'ÇUBUK', 'ELMADAĞ', 'ETİMESGUT', 'EVREN', 'GÖLBAŞI',
      'GÜDÜL', 'HAYMANA', 'KALECİK', 'KIZILCAHAMAM', 'MAMAK', 'NALLIHAN',
      'POLATLI', 'PURSAKLAR', 'SİNCAN', 'ŞEREFLİKOÇHİSAR', 'YENİMAHALLE'
    ]
  },
  {
    name: 'ANTALYA',
    plateCode: '07',
    districts: [
      'AKSEKİ', 'AKSU', 'ALANYA', 'DEMRE', 'DÖŞEMEALTI', 'ELMALI',
      'FİNİKE', 'GAZİPAŞA', 'GÜNDOĞMUŞ', 'İBRADI', 'KAŞ', 'KEMER',
      'KEPEZ', 'KONYAALTI', 'KORKUTELI', 'KUMLUCA', 'MANAVGAT', 'MURATPAŞA',
      'SERİK'
    ]
  },
  {
    name: 'ARTVİN',
    plateCode: '08',
    districts: [
      'ARDANUÇ', 'ARHAVİ', 'BORÇKA', 'HOPA', 'MERKEZ', 'MURGUL',
      'ŞAVŞAT', 'YUSUFELİ'
    ]
  },
  {
    name: 'AYDIN',
    plateCode: '09',
    districts: [
      'BOZDOĞAN', 'BUHARKENT', 'ÇİNE', 'DİDİM', 'EFELER', 'GERMENCİK',
      'İNCİRLİOVA', 'KARACASU', 'KARPUZLU', 'KOÇARLI', 'KÖŞK', 'KUŞADASI',
      'KUYUCAK', 'NAZİLLİ', 'SÖKE', 'SULTANHİSAR', 'YENİPAZAR'
    ]
  },
  {
    name: 'BALIKESİR',
    plateCode: '10',
    districts: [
      'ALTIEYLÜL', 'AYVALIK', 'BALYA', 'BANDIRMA', 'BİGADİÇ', 'BURHANİYE',
      'DURSUNBEY', 'EDREMİT', 'ERDEK', 'GÖMEÇ', 'GÖNEN', 'HAVRAN',
      'İVRİNDİ', 'KARESİ', 'KEPSUT', 'MANYAS', 'MARMARA', 'SAVAŞTEPE',
      'SINDIRGI', 'SUSURLUK'
    ]
  },
  {
    name: 'BİLECİK',
    plateCode: '11',
    districts: [
      'BOZÜYÜK', 'GÖLPAZARI', 'İNHİSAR', 'MERKEZ', 'OSMANELİ',
      'PAZARYERİ', 'SÖĞÜT', 'YENİPAZAR'
    ]
  },
  {
    name: 'BİNGÖL',
    plateCode: '12',
    districts: [
      'ADAKLI', 'GENÇ', 'KARLIOVA', 'KİĞI', 'MERKEZ', 'SOLHAN', 'YAYLADERE', 'YEDİSU'
    ]
  },
  {
    name: 'BİTLİS',
    plateCode: '13',
    districts: [
      'ADİLCEVAZ', 'AHLAT', 'GÜROYMAK', 'HİZAN', 'MERKEZ', 'MUTKİ', 'TATVAN'
    ]
  },
  {
    name: 'BOLU',
    plateCode: '14',
    districts: [
      'DÖRTDİVAN', 'GEREDE', 'GÖYNÜK', 'KIBRISCIK', 'MENGEN', 'MERKEZ',
      'MUDURNU', 'SEBEN', 'YENİÇAĞA'
    ]
  },
  {
    name: 'BURDUR',
    plateCode: '15',
    districts: [
      'AĞLASUN', 'ALTINYAYLA', 'BUCAK', 'ÇAVDIR', 'ÇELTİKÇİ', 'GÖLHİSAR',
      'KARAMANLI', 'KEMER', 'MERKEZ', 'TEFENNİ', 'YEŞİLOVA'
    ]
  },
  {
    name: 'BURSA',
    plateCode: '16',
    districts: [
      'BÜYÜKORHAN', 'GEMLİK', 'GÜRSU', 'HARMANCIK', 'İNEGÖL', 'İZNİK',
      'KARACABEY', 'KELES', 'KESTEL', 'MUDANYA', 'MUSTAFAKEMALPAŞA',
      'NİLÜFER', 'ORHANELİ', 'ORHANGAZİ', 'OSMANGAZİ', 'YENİŞEHİR', 'YILDIRIM'
    ]
  },
  {
    name: 'ÇANAKKALE',
    plateCode: '17',
    districts: [
      'AYVACIK', 'BAYRAMİÇ', 'BİGA', 'BOZCAADA', 'ÇAN', 'ECEABAT',
      'EZİNE', 'GELİBOLU', 'GÖKÇEADA', 'LAPSEKİ', 'MERKEZ', 'YENİCE'
    ]
  },
  {
    name: 'ÇANKIRI',
    plateCode: '18',
    districts: [
      'ATKARACALAR', 'BAYRAMÖREN', 'ÇERKEŞ', 'ELDİVAN', 'ILGAZ', 'KIZILIRMAK',
      'KORGUN', 'KURŞUNLU', 'MERKEZ', 'ORTA', 'ŞABANÖZÜ', 'YAPRAKLI'
    ]
  },
  {
    name: 'ÇORUM',
    plateCode: '19',
    districts: [
      'ALACA', 'BAYAT', 'BOĞAZKALE', 'DODURGA', 'İSKİLİP', 'KARGI',
      'LAÇİN', 'MECİTÖZÜ', 'MERKEZ', 'OĞUZLAR', 'ORTAKÖY', 'OSMANCIK',
      'SUNGURLU', 'UĞURLUDAĞ'
    ]
  },
  {
    name: 'DENİZLİ',
    plateCode: '20',
    districts: [
      'ACIPAYAM', 'BABADAĞ', 'BAKLAN', 'BEKİLLİ', 'BEYAĞAÇ', 'BOZKURT',
      'BULDAN', 'ÇAL', 'ÇAMELİ', 'ÇARDAK', 'ÇİVRİL', 'GÜNEY', 'HONAZ',
      'KALE', 'MERKEZ', 'PAMUKKALE', 'SARAYKÖY', 'SERİNHİSAR', 'TAVAS'
    ]
  },
  {
    name: 'DİYARBAKIR',
    plateCode: '21',
    districts: [
      'BAĞLAR', 'BİSMİL', 'ÇERMİK', 'ÇINAR', 'ÇÜNGÜŞ', 'DİCLE', 'EĞİL',
      'ERGANİ', 'HANİ', 'HAZRO', 'KAYAPINAR', 'KOCAKÖY', 'KULP', 'LİCE',
      'SİLVAN', 'SUR', 'YENİŞEHİR'
    ]
  },
  {
    name: 'DÜZCE',
    plateCode: '81',
    districts: [
      'AKÇAKOCA', 'CUMAYERİ', 'ÇİLİMLİ', 'GÖLYAKA', 'GÜMÜŞOVA',
      'KAYNAŞLI', 'MERKEZ', 'YIĞILCA'
    ]
  },
  {
    name: 'EDİRNE',
    plateCode: '22',
    districts: [
      'ENEZ', 'HAVSA', 'İPSALA', 'KEŞAN', 'LALAPAŞA', 'MERİÇ', 'MERKEZ',
      'SÜLOĞLU', 'UZUNKÖPRÜ'
    ]
  },
  {
    name: 'ELAZIĞ',
    plateCode: '23',
    districts: [
      'AĞIN', 'ALACAKAYA', 'ARICAK', 'BASKİL', 'KARAKOÇAN', 'KEBAN',
      'KOVANCILAR', 'MADEN', 'MERKEZ', 'PALU', 'SİVRİCE'
    ]
  },
  {
    name: 'ERZİNCAN',
    plateCode: '24',
    districts: [
      'ÇAYIRLI', 'İLİÇ', 'KEMAH', 'KEMALİYE', 'MERKEZ', 'OTLUKBELİ',
      'REFAHİYE', 'TERCAN', 'ÜZÜMLÜ'
    ]
  },
  {
    name: 'ERZURUM',
    plateCode: '25',
    districts: [
      'AŞKALE', 'AZİZİYE', 'ÇAT', 'HINIS', 'HORASAN', 'İSPİR', 'KARAYAZI',
      'KÖPRÜKÖY', 'NARMAN', 'OLTU', 'OLUR', 'PALANDÖKEN', 'PASİNLER',
      'PAZARYOLU', 'ŞENKAYA', 'TEKMAN', 'TORTUM', 'UZUNDERE', 'YAKUTİYE'
    ]
  },
  {
    name: 'ESKİŞEHİR',
    plateCode: '26',
    districts: [
      'ALPU', 'BEYLİKOVA', 'ÇİFTELER', 'GÜNYÜZÜ', 'HAN', 'İNÖNÜ',
      'MAHMUDİYE', 'MİHALGAZİ', 'MİHALIÇÇIK', 'ODUNPAZARI', 'SARICAKAYA',
      'SEYİTGAZİ', 'SİVRİHİSAR', 'TEPEBAŞI'
    ]
  },
  {
    name: 'GAZİANTEP',
    plateCode: '27',
    districts: [
      'ARABAN', 'İSLAHİYE', 'KARKAMIŞ', 'NİZİP', 'NURDAĞI', 'OĞUZELİ',
      'ŞAHİNBEY', 'ŞEHİTKAMİL', 'YAVUZELİ'
    ]
  },
  {
    name: 'GİRESUN',
    plateCode: '28',
    districts: [
      'ALUCRA', 'BULANCAK', 'ÇAMOLUK', 'DERELİ', 'DOĞANKENT', 'ESPİYE',
      'EYNESİL', 'GÖRELE', 'GÜCE', 'KEŞAP', 'MERKEZ', 'PİRAZİZ', 'ŞEBİNKARAHİSAR',
      'TİREBOLU', 'YAĞLIDERE'
    ]
  },
  {
    name: 'GÜMÜŞHANE',
    plateCode: '29',
    districts: [
      'KELKİT', 'KÖSE', 'KÜRTÜN', 'MERKEZ', 'ŞİRAN', 'TORUL'
    ]
  },
  {
    name: 'HAKKARİ',
    plateCode: '30',
    districts: [
      'ÇUKURCA', 'DERECİK', 'MERKEZ', 'ŞEMDİNLİ', 'YÜKSEKOVA'
    ]
  },
  {
    name: 'HATAY',
    plateCode: '31',
    districts: [
      'ALTINÖZÜ', 'ANTAKYA', 'ARSUZ', 'BELEN', 'DEFNE', 'DÖRTYOL',
      'ERZİN', 'HASSA', 'İSKENDERUN', 'KIRIKHAN', 'KUMLU', 'PAYAS',
      'REYHANLI', 'SAMANDAĞ', 'YAYLADAĞI'
    ]
  },
  {
    name: 'ISPARTA',
    plateCode: '32',
    districts: [
      'AKSU', 'ATABEY', 'EĞİRDİR', 'GELENDOST', 'GÖNEN', 'KEÇİBORLU',
      'MERKEZ', 'SENİRKENT', 'SÜTÇÜLER', 'ŞARKIKARAAĞAÇ', 'ULUBORLU',
      'YALVAÇ', 'YENİŞARBADEMLİ'
    ]
  },
  {
    name: 'MERSİN',
    plateCode: '33',
    districts: [
      'AKDENİZ', 'ANAMUR', 'AYDINCİK', 'BOZYAZI', 'ÇAMLIYAyla', 'ERDEMLİ',
      'GÜLNAR', 'MEZİTLİ', 'MUT', 'SİLİFKE', 'TARSUS', 'TOROSLAR', 'YENİŞEHİR'
    ]
  },
  {
    name: 'İSTANBUL',
    plateCode: '34',
    districts: [
      'ADALAR', 'ARNAVUTKÖY', 'ATAŞEHİR', 'AVCILAR', 'BAĞCILAR', 'BAHÇELİEVLER',
      'BAKIRKÖY', 'BAŞAKŞEHİR', 'BAYRAMPAŞA', 'BEŞİKTAŞ', 'BEYKOZ', 'BEYLİKDÜZÜ',
      'BEYOĞLU', 'BÜYÜKÇEKMECE', 'ÇATALCA', 'ÇEKMEKÖY', 'ESENLER', 'ESENYURT',
      'EYÜPSULTAN', 'FATİH', 'GAZİOSMANPAŞA', 'GÜNGÖREN', 'KAĞITHANE', 'KARTAL',
      'KÜÇÜKÇEKMECE', 'MALTEPE', 'PENDİK', 'SANCAKTEPE', 'SARIYER', 'SİLİVRİ',
      'SULTANBEYLİ', 'SULTANGAZİ', 'ŞİLE', 'ŞİŞLİ', 'TUZLA', 'ÜMRANİYE',
      'ÜSKÜDAR', 'ZEYTİNBURNU'
    ]
  },
  {
    name: 'İZMİR',
    plateCode: '35',
    districts: [
      'ALİAĞA', 'BALÇOVA', 'BAYINDIR', 'BAYRAKLI', 'BERGAMA', 'BORNOVA',
      'BUCA', 'ÇEŞME', 'ÇİĞLİ', 'DİKİLİ', 'FOÇA', 'GAZİEMİR', 'GÜZELBAHÇE',
      'KARABAĞLAR', 'KARABURUN', 'KARŞIYAKA', 'KEMALPASA', 'KİRAZ', 'KONAK',
      'MENDERES', 'MENEMEN', 'NARLIDERE', 'ÖDEMİŞ', 'SEFERİHİSAR', 'SELÇUK',
      'TİRE', 'TORBALI', 'URLA'
    ]
  },
  {
    name: 'KARS',
    plateCode: '36',
    districts: [
      'AKYAKA', 'ARPAÇAY', 'DİGOR', 'KAĞIZMAN', 'MERKEZ', 'SARIKAMIŞ',
      'SELİM', 'SUSUZ'
    ]
  },
  {
    name: 'KASTAMONU',
    plateCode: '37',
    districts: [
      'ABANA', 'ARAÇ', 'AZDAVAY', 'BOZKURT', 'CİDE', 'ÇATALZEYTİN',
      'DADAY', 'DEVREKANİ', 'DOĞANYURT', 'HANÖNÜ', 'İHSANGAZİ', 'İNEBOLU',
      'KÜRE', 'MERKEZ', 'PINARBAŞI', 'ŞENPAZAR', 'SEYDILER', 'TAŞKÖPRÜ',
      'TOSYA'
    ]
  },
  {
    name: 'KAYSERİ',
    plateCode: '38',
    districts: [
      'AKKIŞLA', 'BÜNYAN', 'DEVELİ', 'FELAHİYE', 'HACILAR', 'İNCESU',
      'KOCASİNAN', 'MELİKGAZİ', 'ÖZVATAN', 'PINARBAŞI', 'SARIOĞLAN',
      'SARIZ', 'TALAS', 'TOMARZA', 'YAHYALI', 'YEŞİLHİSAR'
    ]
  },
  {
    name: 'KIRKLARELİ',
    plateCode: '39',
    districts: [
      'BABAESKI', 'DEMİRKÖY', 'KOFÇAZ', 'LÜLEBURGAZ', 'MERKEZ',
      'PEHLİVANKÖY', 'PINARHİSAR', 'VİZE'
    ]
  },
  {
    name: 'KIRŞEHİR',
    plateCode: '40',
    districts: [
      'AKÇAKENT', 'AKPINAR', 'BOZTEPE', 'ÇİÇEKDAĞI', 'KAMAN',
      'MERKEZ', 'MUCUR'
    ]
  },
  {
    name: 'KOCAELİ',
    plateCode: '41',
    districts: [
      'BAŞİSKELE', 'ÇAYIROVA', 'DARICA', 'DERİNCE', 'DİLOVASI',
      'GEBZE', 'GÖLCÜK', 'İZMİT', 'KANDIRA', 'KARAMÜRSEL', 'KARTEPE', 'KÖRFEZ'
    ]
  },
  {
    name: 'KONYA',
    plateCode: '42',
    districts: [
      'AHIRLI', 'AKÖREN', 'AKŞEHIR', 'ALTINEKİN', 'BEYŞEHİR', 'BOZKIR',
      'CIHANBEYLI', 'ÇELTİK', 'ÇUMRA', 'DERBENT', 'DEREBUCAK', 'DOĞANHİSAR',
      'EMİRGAZİ', 'EREĞLİ', 'GÜNEYSINIR', 'HALKAPINAR', 'HÜYÜK', 'ILGIN',
      'KADINHANI', 'KARAPINAR', 'KARATAY', 'KULU', 'MERAM', 'SARAYÖNÜ',
      'SELÇUKLU', 'SEYDİŞEHİR', 'TAŞKENT', 'TUZLUKÇU', 'YALIHÜYÜK', 'YUNAK'
    ]
  },
  {
    name: 'KÜTAHYA',
    plateCode: '43',
    districts: [
      'ALTINTAŞ', 'ASLANAPA', 'ÇAVDARHİSAR', 'DOMANIÇ', 'DUMLUPINAR',
      'EMET', 'GEDİZ', 'HİSARCIK', 'MERKEZ', 'PAZARLAR', 'SİMAV',
      'ŞAPHANE', 'TAVŞANLI'
    ]
  },
  {
    name: 'MALATYA',
    plateCode: '44',
    districts: [
      'AKÇADAĞ', 'ARAPGİR', 'ARGUVAN', 'BATTALGAZİ', 'DARENDE', 'DOĞANŞEHİR',
      'DOĞANYOL', 'HEKİMHAN', 'KALE', 'KULUNCAK', 'PÜTÜRGE', 'YAZIHAN', 'YEŞİLYURT'
    ]
  },
  {
    name: 'MANİSA',
    plateCode: '45',
    districts: [
      'AHMETLİ', 'AKHİSAR', 'ALAŞEHİR', 'DEMİRCİ', 'GÖLMARMARA', 'GÖRDES',
      'KIRKAĞAÇ', 'KÖPRÜBAŞI', 'KULA', 'SALİHLİ', 'SARIGÖL', 'SARUHANLI',
      'SELENDİ', 'SOMA', 'ŞEHZADELER', 'TURGUTLU', 'YUNUSEMRE'
    ]
  },
  {
    name: 'KAHRAMANMARAŞ',
    plateCode: '46',
    districts: [
      'AFŞİN', 'ANDIRIN', 'ÇAĞLAYANCERIT', 'DULKADİROĞLU', 'EKİNÖZÜ',
      'ELBİSTAN', 'GÖKSUN', 'NURHAK', 'ONİKİŞUBAT', 'PAZARCIK', 'TÜRKOĞLU'
    ]
  },
  {
    name: 'MARDİN',
    plateCode: '47',
    districts: [
      'ARTUKLU', 'DARGEÇİT', 'DERECİK', 'KIZILTEPE', 'MAZIDAĞI', 'MİDYAT',
      'NUSAYBİN', 'ÖMERLİ', 'SAVUR', 'YEŞİLLİ'
    ]
  },
  {
    name: 'MUĞLA',
    plateCode: '48',
    districts: [
      'BODRUM', 'DALAMAN', 'DATÇA', 'FETHİYE', 'KAVAKLIDERE', 'KÖYCEĞİZ',
      'MARMARİS', 'MENTEŞE', 'MİLAS', 'ORTACA', 'SEYDİKEMER', 'ULA', 'YATAĞAN'
    ]
  },
  {
    name: 'MUŞ',
    plateCode: '49',
    districts: [
      'BULANIK', 'HASKÖY', 'KORKUT', 'MALAZGİRT', 'MERKEZ', 'VARTO'
    ]
  },
  {
    name: 'NEVŞEHİR',
    plateCode: '50',
    districts: [
      'ACIGÖL', 'AVANOS', 'DERİNKUYU', 'GÜLŞEHİR', 'HACIBEKTAŞ',
      'KOZAKLI', 'MERKEZ', 'ÜRGÜP'
    ]
  },
  {
    name: 'NİĞDE',
    plateCode: '51',
    districts: [
      'ALTUNHİSAR', 'BOR', 'ÇAMARDI', 'ÇİFTLİK', 'MERKEZ', 'ULUKIŞLA'
    ]
  },
  {
    name: 'ORDU',
    plateCode: '52',
    districts: [
      'AKKUŞ', 'ALTINORDU', 'AYBASTI', 'ÇAMAŞ', 'ÇATALPINAR', 'ÇAYBAŞI',
      'FATSA', 'GÖLKÖY', 'GÜLYALI', 'GÜRGENTEPE', 'İKİZCE', 'KABADÜZ',
      'KABATAŞ', 'KORGAN', 'KUMRU', 'MESUDİYE', 'PERŞEMBE', 'ULUBEY', 'ÜNYE'
    ]
  },
  {
    name: 'RİZE',
    plateCode: '53',
    districts: [
      'ARDEŞEN', 'ÇAMLIHEMŞİN', 'ÇAYELİ', 'DEREPAZARİ', 'FINDIKLI',
      'GÜNEYSU', 'HEMŞİN', 'İKİZDERE', 'İYİDERE', 'KALKANDERE', 'MERKEZ', 'PAZAR'
    ]
  },
  {
    name: 'SAKARYA',
    plateCode: '54',
    districts: [
      'ADAPAZARI', 'AKYAZI', 'ARIFİYE', 'ERENLER', 'FERIZLİ', 'GEYVE',
      'HENDEK', 'KARAPÜRÇEK', 'KARASU', 'KAYNARCA', 'KOCALİ', 'PAMUKOVA',
      'SAPANCA', 'SERDİVAN', 'SÖĞÜTLÜ', 'TARAKLI'
    ]
  },
  {
    name: 'SAMSUN',
    plateCode: '55',
    districts: [
      'ALAÇAM', 'ASARCIK', 'ATAKUM', 'AYVACIK', 'BAFRA', 'CANİK',
      'ÇARŞAMBA', 'HAVZA', 'İLKADIM', 'KAVAK', 'LADİK', 'ONDOKUZMAYIS',
      'SALIPAZARI', 'TEKKEKÖY', 'TERME', 'VEZİRKÖPRÜ', 'YAKAKENT'
    ]
  },
  {
    name: 'SİİRT',
    plateCode: '56',
    districts: [
      'AYDINLAR', 'BAYKAN', 'ERUH', 'KURTALAN', 'MERKEZ', 'PERVARİ', 'ŞİRVAN'
    ]
  },
  {
    name: 'SİNOP',
    plateCode: '57',
    districts: [
      'AYANCIK', 'BOYABAT', 'DİKMEN', 'DURAĞAN', 'ERFELEK', 'GERZE',
      'MERKEZ', 'SARAYDÜZÜ', 'TÜRKELİ'
    ]
  },
  {
    name: 'SİVAS',
    plateCode: '58',
    districts: [
      'AKINCİLAR', 'ALTINYAYLA', 'DİVRİĞİ', 'DOĞANŞAR', 'GEMEREK',
      'GÖLOVA', 'HAFIK', 'İMRANLI', 'KANGAL', 'KOYULHİSAR', 'MERKEZ',
      'SUŞEHRI', 'ŞARKIŞLA', 'ULAŞ', 'YILDIZELİ', 'ZARA'
    ]
  },
  {
    name: 'TEKİRDAĞ',
    plateCode: '59',
    districts: [
      'ÇERKEZKÖY', 'ÇORLU', 'ERGENE', 'HAYRABOLU', 'KAPAKLI', 'MALKARA',
      'MARMARAEREĞLİSİ', 'MURATLI', 'SARAY', 'SÜLEYMANPAŞA', 'ŞARKÖY'
    ]
  },
  {
    name: 'TOKAT',
    plateCode: '60',
    districts: [
      'ALMUS', 'ARTOVA', 'BAŞÇIFTLIK', 'ERBAA', 'MERKEZ', 'NİKSAR',
      'PAZAR', 'REŞADİYE', 'SULUSARAY', 'TURHAL', 'YEŞİLYURT', 'ZİLE'
    ]
  },
  {
    name: 'TRABZON',
    plateCode: '61',
    districts: [
      'AKÇAABAT', 'ARAKLI', 'ARSİN', 'BEŞİKDÜZÜ', 'ÇAYKARA', 'ÇARŞIBAŞI',
      'DERNEKPAZARI', 'DÜZKÖY', 'HAYRAT', 'KÖPRÜBAŞI', 'LAST', 'MAÇKA',
      'OF', 'ORTAHİSAR', 'SÜRMENE', 'ŞALPAZARI', 'TONYA', 'VAKFIKEBİR', 'YOMRA'
    ]
  },
  {
    name: 'TUNCELİ',
    plateCode: '62',
    districts: [
      'ÇEMİŞGEZEK', 'HOZAT', 'MAZGİRT', 'MERKEZ', 'NAZIMİYE',
      'OVACIK', 'PERTEK', 'PÜLÜMÜR'
    ]
  },
  {
    name: 'ŞANLIURFA',
    plateCode: '63',
    districts: [
      'AKÇAKALE', 'BİRECİK', 'BOZOVA', 'CEYLANPINAR', 'EYYÜBİYE',
      'HALFETİ', 'HALİLİYE', 'HARRAN', 'HİLVAN', 'KARAKÖPRÜ', 'SİVEREK',
      'SURUÇ', 'VİRANŞEHİR'
    ]
  },
  {
    name: 'UŞAK',
    plateCode: '64',
    districts: [
      'BANAZ', 'EŞME', 'KARAHALLI', 'MERKEZ', 'SİVASLI', 'ULUBEY'
    ]
  },
  {
    name: 'VAN',
    plateCode: '65',
    districts: [
      'BAHÇESARAY', 'BAŞKALE', 'ÇALDIRAN', 'ÇATAK', 'EDREMİT', 'ERCİŞ',
      'GEVAŞ', 'GÜRPINAR', 'İPEKYOLU', 'MURADIYE', 'ÖZALP', 'SARAY', 'TUŞBA'
    ]
  },
  {
    name: 'YOZGAT',
    plateCode: '66',
    districts: [
      'AKDAĞMADENİ', 'AYDINCIK', 'BOĞAZLIYAN', 'ÇANDIR', 'ÇAYIRALAN',
      'ÇEKEREK', 'KADIŞEHRİ', 'MERKEZ', 'SARAYKENT', 'SARIKEÇILI', 'SORGUN',
      'ŞEFAATLİ', 'YENİFAKILI', 'YERKÖY'
    ]
  },
  {
    name: 'ZONGULDAK',
    plateCode: '67',
    districts: [
      'ALAPLI', 'ÇAYCUMA', 'DEVREK', 'GÖKÇEBEY', 'KILIMLı', 'KOZLU', 'MERKEZ'
    ]
  },
  {
    name: 'AKSARAY',
    plateCode: '68',
    districts: [
      'AĞAÇÖREN', 'ESKİL', 'GÜLAĞAÇ', 'GÜZELYURT', 'MERKEZ', 'ORTAKÖY', 'SARIYAHŞi'
    ]
  },
  {
    name: 'BAYBURT',
    plateCode: '69',
    districts: ['DEMİRÖZÜ', 'MERKEZ', 'AYDINOĞLU']
  },
  {
    name: 'KARAMAN',
    plateCode: '70',
    districts: [
      'AYRANCI', 'BAŞYAYLA', 'ERMENEK', 'KAZIMKARABEKİR', 'MERKEZ', 'SARIVELİLER'
    ]
  },
  {
    name: 'KIRIKKALE',
    plateCode: '71',
    districts: [
      'BAHŞİLİ', 'BALIŞEYH', 'ÇELEBİ', 'DELİCE', 'KARAKEÇİLİ', 'KESKİN',
      'MERKEZ', 'SULAKYURT', 'YAHŞİHAN'
    ]
  },
  {
    name: 'BATMAN',
    plateCode: '72',
    districts: [
      'BEŞİRİ', 'GERCÜŞ', 'HASANKEYF', 'KOZLUK', 'MERKEZ', 'SASON'
    ]
  },
  {
    name: 'ŞIRNAK',
    plateCode: '73',
    districts: [
      'BEYTÜŞŞEBAp', 'CİZRE', 'GÜÇLÜKONAK', 'İDİL', 'MERKEZ', 'SİLOPİ', 'ULUDERE'
    ]
  },
  {
    name: 'BARTIN',
    plateCode: '74',
    districts: ['AMASRA', 'KURUCAŞİLE', 'MERKEZ', 'ULUS']
  },
  {
    name: 'ARDAHAN',
    plateCode: '75',
    districts: ['ÇILDIR', 'DAMAL', 'GÖLE', 'HANAK', 'MERKEZ', 'POSOF']
  },
  {
    name: 'IĞDIR',
    plateCode: '76',
    districts: ['ARALIK', 'KARAKOYUNLU', 'MERKEZ', 'TUZLUCA']
  },
  {
    name: 'YALOVA',
    plateCode: '77',
    districts: ['ALTINOVA', 'ARMUTLU', 'ÇİFTLİKKÖY', 'ÇINARCIK', 'MERKEZ', 'TERMAL']
  },
  {
    name: 'KARABÜK',
    plateCode: '78',
    districts: ['EFLANİ', 'ESKİPAZAR', 'MERKEZ', 'OVACIK', 'SAFRANBOLU', 'YENİCE']
  },
  {
    name: 'KİLİS',
    plateCode: '79',
    districts: ['ELBEYLİ', 'MERKEZ', 'MUSABEYLI', 'POLATELi']
  },
  {
    name: 'OSMANİYE',
    plateCode: '80',
    districts: [
      'BAHÇE', 'DÜZİÇİ', 'HASANBEYLİ', 'KADİRLİ', 'MERKEZ', 'SUMBAS', 'TOPRAKKALE'
    ]
  }
];

async function geographySeed() {
  console.log('  → Creating geography data (81 provinces, 973 districts)...');

  let provinceCount = 0;
  let districtCount = 0;

  for (const provinceData of TURKEY_GEOGRAPHY_DATA) {
    // İl oluştur
    const province = await prisma.province.upsert({
      where: { name: provinceData.name },
      update: {},
      create: {
        name: provinceData.name,
        plateCode: provinceData.plateCode,
      },
    });

    provinceCount++;

    // İlçeleri oluştur
    for (const districtName of provinceData.districts) {
      await prisma.district.upsert({
        where: {
          name_provinceId: {
            name: districtName,
            provinceId: province.id,
          },
        },
        update: {},
        create: {
          name: districtName,
          provinceId: province.id,
        },
      });

      districtCount++;
    }
  }

  console.log(`     ✓ Created ${provinceCount} provinces and ${districtCount} districts`);
}

async function main() {
  // İl-İlçe verilerini önce oluştur
  await geographySeed();
  // Varsayılan admin kullanıcısı
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kuryem.com' },
    update: {},
    create: {
      email: 'admin@kuryem.com',
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin kullanıcı oluşturuldu:', admin.email);

  // Test firma kullanıcısı
  const companyPassword = await bcrypt.hash('firma123', 10);
  const company = await prisma.user.upsert({
    where: { email: 'firma@test.com' },
    update: {},
    create: {
      email: 'firma@test.com',
      password: companyPassword,
      role: UserRole.COMPANY,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Test firma kullanıcısı oluşturuldu:', company.email);

  // Test kurye kullanıcısı
  const courierPassword = await bcrypt.hash('kurye123', 10);
  const courier = await prisma.user.upsert({
    where: { email: 'kurye@test.com' },
    update: {},
    create: {
      email: 'kurye@test.com',
      password: courierPassword,
      role: UserRole.COURIER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Test kurye kullanıcısı oluşturuldu:', courier.email);

  // Test firma için Company kaydı oluştur
  await prisma.company.upsert({
    where: { userId: company.id },
    update: {},
    create: {
      userId: company.id,
      name: 'Test Firma Ltd. Şti.',
      taxNumber: '1234567890',
      taxOffice: 'Beylikdüzü',
      phone: '+90 212 555 0123',
      address: {
        street: 'Test Caddesi No:123',
        city: 'İstanbul',
        district: 'Beylikdüzü',
        postalCode: '34520',
        country: 'Türkiye'
      },
      contactPerson: {
        fullName: 'Ahmet Yılmaz',
        phone: '+90 532 555 0123',
        email: 'ahmet@test-firma.com',
        title: 'Genel Müdür'
      },
      status: 'APPROVED', // Onaylanmış durumda
      activityArea: 'E-ticaret ve Lojistik',
    },
  });

  console.log('Test firma Company kaydı oluşturuldu');

  // Test kurye için Courier kaydı oluştur
  await prisma.courier.upsert({
    where: { userId: courier.id },
    update: {},
    create: {
      userId: courier.id,
      fullName: 'Mehmet Demir',
      tcNumber: '12345678901',
      phone: '+90 532 555 0456',
      birthDate: new Date('1990-05-15'),
      vehicleInfo: {
        type: 'MOTORCYCLE',
        brand: 'Honda',
        model: 'CB150R',
        year: '2020',
        plateNumber: '34 ABC 123',
        color: 'Kırmızı'
      },
      licenseInfo: {
        licenseNumber: 'A12345678',
        licenseType: 'A2',
        expiryDate: new Date('2030-12-31')
      },
      status: 'APPROVED', // Onaylanmış durumda
      rating: 4.8,
      totalDeliveries: 0,
      emergencyContact: {
        name: 'Fatma Demir',
        phone: '+90 532 555 0789',
        relationship: 'Eş'
      },
    },
  });

  console.log('Test kurye Courier kaydı oluşturuldu');

  // Varsayılan sistem ayarları
  const defaultSettings = [
    { key: 'commission.rate', value: 0.15, description: 'Komisyon oranı' },
    { key: 'commission.minAmount', value: 5, description: 'Minimum komisyon tutarı' },
    { key: 'order.maxCancellationTime', value: 5, description: 'İptal süresi (dakika)' },
    { key: 'order.autoAssignRadius', value: 5, description: 'Otomatik atama yarıçapı (km)' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Sistem ayarları oluşturuldu');

  // Hizmet bölgeleri oluştur
  const serviceAreas = [
    {
      name: 'Beylikdüzü',
      city: 'İstanbul',
      district: 'Beylikdüzü',
      boundaries: [
        { lat: 40.9802, lng: 28.6434 },
        { lat: 41.0166, lng: 28.6434 },
        { lat: 41.0166, lng: 28.7090 },
        { lat: 40.9802, lng: 28.7090 },
      ],
      basePrice: 15,
      pricePerKm: 3,
      maxDistance: 30,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Avcılar',
      city: 'İstanbul',
      district: 'Avcılar',
      boundaries: [
        { lat: 40.9739, lng: 28.7090 },
        { lat: 41.0050, lng: 28.7090 },
        { lat: 41.0050, lng: 28.7650 },
        { lat: 40.9739, lng: 28.7650 },
      ],
      basePrice: 15,
      pricePerKm: 3,
      maxDistance: 25,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Esenyurt',
      city: 'İstanbul',
      district: 'Esenyurt',
      boundaries: [
        { lat: 41.0166, lng: 28.6434 },
        { lat: 41.0583, lng: 28.6434 },
        { lat: 41.0583, lng: 28.7090 },
        { lat: 41.0166, lng: 28.7090 },
      ],
      basePrice: 17,
      pricePerKm: 3.5,
      maxDistance: 35,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Başakşehir',
      city: 'İstanbul',
      district: 'Başakşehir',
      boundaries: [
        { lat: 41.0583, lng: 28.7650 },
        { lat: 41.1200, lng: 28.7650 },
        { lat: 41.1200, lng: 28.8500 },
        { lat: 41.0583, lng: 28.8500 },
      ],
      basePrice: 20,
      pricePerKm: 4,
      maxDistance: 40,
      isActive: true,
      priority: 1,
    },
    {
      name: 'Bakırköy',
      city: 'İstanbul',
      district: 'Bakırköy',
      boundaries: [
        { lat: 40.9594, lng: 28.7650 },
        { lat: 40.9900, lng: 28.7650 },
        { lat: 40.9900, lng: 28.8500 },
        { lat: 40.9594, lng: 28.8500 },
      ],
      basePrice: 18,
      pricePerKm: 3.5,
      maxDistance: 30,
      isActive: true,
      priority: 1,
    },
  ];

  for (const area of serviceAreas) {
    await prisma.serviceArea.upsert({
      where: { name: area.name },
      update: {},
      create: area as any,
    });
    console.log('Hizmet bölgesi oluşturuldu:', area.name);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed işlemi tamamlandı!');
  })
  .catch(async (e) => {
    console.error('Seed hatası:', e);
    await prisma.$disconnect();
    process.exit(1);
  });