export interface ProductoSeed {
  Identificación: string;
  Nombre: string;
  Categoría: string;
  Precio: string;
  Existencias: string;
  Imagen: string;
  imagen_url: string;
  resaltado: boolean;
}

export const PRODUCTOS_AGRICOVET_SEED: ProductoSeed[] = [
  // RAINBOW
  { Identificación: 'RB_01', Nombre: 'Leñador 16 EW galón', Categoría: 'Herbicidas', Precio: '250.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_02', Nombre: 'Terraquat 20 SL galón', Categoría: 'Herbicidas', Precio: '280.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_03', Nombre: 'Torban 30.4 SL litro', Categoría: 'Insecticidas', Precio: '180.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_04', Nombre: 'Anorak 60 EC litro', Categoría: 'Insecticidas', Precio: '320.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_05', Nombre: 'Revolver 36 5 SL litro', Categoría: 'Herbicidas', Precio: '210.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_06', Nombre: 'Kaindor plus 30 SC litro', Categoría: 'Insecticidas', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_07', Nombre: 'Dlmaxine 72 SL CANECA', Categoría: 'Herbicidas', Precio: '850.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_08', Nombre: 'Semental 16.5 SL litro', Categoría: 'Herbicidas', Precio: '240.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_09', Nombre: 'Azotela Max 85', Categoría: 'Fungicidas', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_10', Nombre: 'Podador 60 WG 10X10gr', Categoría: 'Fungicidas', Precio: '120.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'RB_11', Nombre: 'Lasonate 90 SP 100 gr', Categoría: 'Insecticidas', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // BAYER/TECUN
  { Identificación: 'BY_01', Nombre: 'Blindage 60 FS', Categoría: 'Insecticidas', Precio: '350.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_02', Nombre: 'Semevin 35 FS', Categoría: 'Insecticidas', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_03', Nombre: 'Semevin 35 FS Litro', Categoría: 'Insecticidas', Precio: '380.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_04', Nombre: 'Certero Normal 250 ml', Categoría: 'Insecticidas', Precio: '210.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_05', Nombre: 'Certero Duo 48 SC', Categoría: 'Insecticidas', Precio: '420.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_06', Nombre: 'Vayego 20 SC', Categoría: 'Insecticidas', Precio: '490.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_07', Nombre: 'Cipermetrina 100 ml', Categoría: 'Antiparasitarios', Precio: '85.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_08', Nombre: 'Cipermetrina 250 ml', Categoría: 'Antiparasitarios', Precio: '160.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_09', Nombre: 'Cipermetrina 500 ml', Categoría: 'Antiparasitarios', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_10', Nombre: 'Cipermetrina Litro', Categoría: 'Antiparasitarios', Precio: '480.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BY_11', Nombre: 'CPF 2DP Libra', Categoría: 'Insecticidas', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // FORAGRO
  { Identificación: 'FG_01', Nombre: 'Forza 60 WP 100 gramos', Categoría: 'Insecticidas', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'FG_02', Nombre: 'Pikudo 20 SC 100 ml', Categoría: 'Insecticidas', Precio: '130.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'FG_03', Nombre: 'Foranex 25.7 SL 1 litro', Categoría: 'Herbicidas', Precio: '220.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'FG_04', Nombre: 'Foliar Plus 1 Litro', Categoría: 'Fertilizantes', Precio: '190.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // SISTEMAS AGROPECUARIOS
  { Identificación: 'SA_01', Nombre: 'Tilosin Plus 10 gr', Categoría: 'Antibióticos', Precio: '45.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_02', Nombre: 'Coriplus 10 gr', Categoría: 'Vitaminas', Precio: '40.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_03', Nombre: 'Lombrifin 10 gr', Categoría: 'Antiparasitarios', Precio: '42.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_04', Nombre: 'Oxiplus Vitaminado 10 gr', Categoría: 'Vitaminas', Precio: '50.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_05', Nombre: 'Socofin BD 10gr', Categoría: 'Antibióticos', Precio: '45.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_06', Nombre: 'Vita vet plus 10gr', Categoría: 'Vitaminas', Precio: '48.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_07', Nombre: 'Chemiestress 10gr', Categoría: 'Vitaminas', Precio: '55.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_08', Nombre: 'Tilosin plus 25 gr', Categoría: 'Antibióticos', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_09', Nombre: 'Oxiplus Vitaminado 25 gr', Categoría: 'Vitaminas', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_10', Nombre: 'Tilosin plus 100 gr', Categoría: 'Antibióticos', Precio: '320.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_11', Nombre: 'Cori plus 100 gr', Categoría: 'Vitaminas', Precio: '280.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_12', Nombre: 'Socofin BD 100 gr', Categoría: 'Antibióticos', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_13', Nombre: 'Vita vet Plus 100 gr', Categoría: 'Vitaminas', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_14', Nombre: 'Lombrifin 100 gr', Categoría: 'Antiparasitarios', Precio: '295.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_15', Nombre: 'Chemiestress 100gr', Categoría: 'Vitaminas', Precio: '340.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_16', Nombre: 'Oxiplus Vitaminado 100 gr', Categoría: 'Vitaminas', Precio: '350.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_17', Nombre: 'Tilosin 10 ml', Categoría: 'Antibióticos', Precio: '60.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_18', Nombre: 'Socofin drog 10 ml', Categoría: 'Antibióticos', Precio: '65.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_19', Nombre: 'Tilosin 25 ml', Categoría: 'Antibióticos', Precio: '130.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_20', Nombre: 'Socofin drog 25 ml', Categoría: 'Antibióticos', Precio: '140.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_21', Nombre: 'Tilosin 100 ml', Categoría: 'Antibióticos', Precio: '420.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_22', Nombre: 'Nexlabet LA 30.1-60kg', Categoría: 'Antibióticos', Precio: '180.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_23', Nombre: 'Nexlabet LA 7.6-15kg', Categoría: 'Antibióticos', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_24', Nombre: 'Nexlabet LA 15-30kg', Categoría: 'Antibióticos', Precio: '130.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_25', Nombre: 'Curabichera 400 ml', Categoría: 'Curativos', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_26', Nombre: 'Crecebest 500 ml', Categoría: 'Vitaminas', Precio: '220.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'SA_27', Nombre: 'Crecebest 100 ml', Categoría: 'Vitaminas', Precio: '85.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // AVINDUSTRIAS
  { Identificación: 'AV_01', Nombre: 'Vitel 100 gr', Categoría: 'Vitaminas', Precio: '75.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AV_02', Nombre: 'Vitel 15 gr', Categoría: 'Vitaminas', Precio: '25.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AV_03', Nombre: 'Multipack 26/52 150 gr', Categoría: 'Vitaminas', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AV_04', Nombre: 'Multipack 26 52 15 gr', Categoría: 'Vitaminas', Precio: '30.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AV_05', Nombre: 'Trimsulfa plus 150 gr', Categoría: 'Antibióticos', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AV_06', Nombre: 'Trimsulfa Plus 15 gr', Categoría: 'Antibióticos', Precio: '35.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // MALLO
  { Identificación: 'MA_01', Nombre: 'Electrolitos y Vitaminas 100 gr', Categoría: 'Vitaminas', Precio: '65.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MA_02', Nombre: 'Electrolitos y Vitaminas 20 gr', Categoría: 'Vitaminas', Precio: '20.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MA_03', Nombre: 'Broximicina 100 gr', Categoría: 'Antibióticos', Precio: '85.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MA_04', Nombre: 'Shampoo Pets 250ml', Categoría: 'Mascotas', Precio: '75.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MA_05', Nombre: 'Vermimax plus 100 Tabletas', Categoría: 'Mascotas', Precio: '190.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MA_06', Nombre: 'Simparica trio 5-10kg', Categoría: 'Mascotas', Precio: '240.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // WELLCO
  { Identificación: 'WE_01', Nombre: 'Broncowell 100 gr', Categoría: 'Respiratorios', Precio: '90.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_02', Nombre: 'Oxyfarm con electrolitos 100 gr', Categoría: 'Vitaminas', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_03', Nombre: 'Caja oxyfarm 20 grs', Categoría: 'Antibióticos', Precio: '150.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_04', Nombre: 'All Trompa 454 gr', Categoría: 'Ganadería', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_05', Nombre: 'All Trompa 100 gr', Categoría: 'Ganadería', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_06', Nombre: 'Oxyfarm inyectable 10 ml', Categoría: 'Antibióticos', Precio: '70.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_07', Nombre: 'Oxyfarm inyectable 50 ml', Categoría: 'Antibióticos', Precio: '210.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_08', Nombre: 'Oxyfarm inyectable 100 ml', Categoría: 'Antibióticos', Precio: '380.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_09', Nombre: 'Oxyfarm inyectable 250 ml', Categoría: 'Antibióticos', Precio: '750.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_10', Nombre: 'Pujantex 250 ml', Categoría: 'Vitaminas', Precio: '280.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_11', Nombre: 'Vita B12 con fósforo 250 ml', Categoría: 'Vitaminas', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_12', Nombre: 'Ferradox plus 100 ml', Categoría: 'Vitaminas', Precio: '195.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_13', Nombre: 'Ferradox plus 10 ml', Categoría: 'Vitaminas', Precio: '45.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_14', Nombre: 'Neocan 120ml', Categoría: 'Mascotas', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_15', Nombre: 'Neocan 240ml', Categoría: 'Mascotas', Precio: '190.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_16', Nombre: 'Defender 10ml', Categoría: 'Mascotas', Precio: '80.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_17', Nombre: 'Defender 50 ml', Categoría: 'Mascotas', Precio: '280.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'WE_18', Nombre: 'Defender 100 ml', Categoría: 'Mascotas', Precio: '490.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // BIOZOO
  { Identificación: 'BZ_01', Nombre: 'Tigent 20 ml', Categoría: 'Antibióticos', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BZ_02', Nombre: 'Tigent 100ml', Categoría: 'Antibióticos', Precio: '340.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BZ_03', Nombre: 'Proteizoo plus 20ml', Categoría: 'Vitaminas', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BZ_04', Nombre: 'Proteizoo Plus 250ml', Categoría: 'Vitaminas', Precio: '620.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BZ_05', Nombre: 'Ganazoo DP 20ml', Categoría: 'Antiparasitarios', Precio: '150.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BZ_06', Nombre: 'Bioxil 7% 500ml', Categoría: 'Antisépticos', Precio: '180.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // LAVET
  { Identificación: 'LV_01', Nombre: 'Dipiron 500 30 ml', Categoría: 'Analgésicos', Precio: '120.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'LV_02', Nombre: 'Labimin 500 ml', Categoría: 'Vitaminas', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // TECNIAGRO
  { Identificación: 'TA_01', Nombre: 'Iverplus La 10ml 1%', Categoría: 'Antiparasitarios', Precio: '65.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'TA_02', Nombre: 'Iverplus la 100 ml 1%', Categoría: 'Antiparasitarios', Precio: '320.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'TA_03', Nombre: 'Farma-Tecnimicina 50ml', Categoría: 'Antibióticos', Precio: '140.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'TA_04', Nombre: 'Farma-tecnimicina 100ml', Categoría: 'Antibióticos', Precio: '260.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'TA_05', Nombre: 'Farma-tecnimicina LA 50ml', Categoría: 'Antibióticos', Precio: '175.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'TA_06', Nombre: 'Farma-tecnimicina LA 100ml', Categoría: 'Antibióticos', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // INSUMOS MODERNOS
  { Identificación: 'IM_01', Nombre: 'Oxitetraciclina plus 250ml', Categoría: 'Antibióticos', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_02', Nombre: 'Oxitetraciclina plus 100 ml', Categoría: 'Antibióticos', Precio: '150.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_03', Nombre: 'Oxitetraciclina plus 50ml', Categoría: 'Antibióticos', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_04', Nombre: 'Oxitetraciclina plus 10ml', Categoría: 'Antibióticos', Precio: '35.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_05', Nombre: 'Verrugan 20 ml', Categoría: 'Cuidado', Precio: '85.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_06', Nombre: 'Verrugan plus 30 ml', Categoría: 'Cuidado', Precio: '120.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_07', Nombre: 'Oxitocina 10ml', Categoría: 'Hormonales', Precio: '55.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_08', Nombre: 'Ectogan Pipeta Spot on', Categoría: 'Mascotas', Precio: '65.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_09', Nombre: 'Ectogan pour On LITRO', Categoría: 'Ganadería', Precio: '380.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'IM_10', Nombre: 'Borogluconato de calcio 250 ml', Categoría: 'Calcio', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // AGRONORSA
  { Identificación: 'AGR_01', Nombre: 'Instavit 500ml', Categoría: 'Vitaminas', Precio: '310.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AGR_02', Nombre: 'Nuvan 1L', Categoría: 'Insecticidas', Precio: '290.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'AGR_03', Nombre: 'Nuvan 100ml', Categoría: 'Insecticidas', Precio: '65.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // AGROSONA
  { Identificación: 'AGS_01', Nombre: 'Rata Quilla Sb caja', Categoría: 'Rodenticidas', Precio: '45.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // BOTICA GANADERA
  { Identificación: 'BG_01', Nombre: 'JB Matagusano', Categoría: 'Curativos', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'BG_02', Nombre: 'Impacto spray', Categoría: 'Insecticidas', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // MODERNA
  { Identificación: 'MOD_01', Nombre: 'Jeringa 1 ml 100U', Categoría: 'Insumos', Precio: '10.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MOD_02', Nombre: 'Jeringa 3 ml 100U', Categoría: 'Insumos', Precio: '12.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MOD_03', Nombre: 'Jeringa 5 ml 100U', Categoría: 'Insumos', Precio: '15.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'MOD_04', Nombre: 'Jeringa 10ml 100U', Categoría: 'Insumos', Precio: '18.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // DUWEST
  { Identificación: 'DW_01', Nombre: 'Lannate 100 ml', Categoría: 'Insecticidas', Precio: '130.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'DW_02', Nombre: 'Mirex 250 gramos', Categoría: 'Insecticidas', Precio: '95.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'DW_03', Nombre: 'Mirex 500 gramos', Categoría: 'Insecticidas', Precio: '175.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },

  // OTROS
  { Identificación: 'OT_01', Nombre: 'Broncobion maxx 30 ml', Categoría: 'Respiratorios', Precio: '110.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'OT_02', Nombre: 'Mielita Vip', Categoría: 'Vitaminas', Precio: '75.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false },
  { Identificación: 'OT_03', Nombre: 'Anticion anticonceptivo', Categoría: 'Hormonales', Precio: '85.00', Existencias: '+ Disponible', Imagen: '', imagen_url: '', resaltado: false }
];
