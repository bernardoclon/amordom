// TypeDataModel is the proper modern Foundry class for system document configurations
// Usamos TypeDataModel, que es la clase moderna en V12+ para definir esquemas ligados a subtipos (ej. actor de tipo 'personaje')
export default class ActorPersonajeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { fields } = foundry.data;

    return {
      concepto: new fields.StringField({ required: false, blank: true, initial: '' }),
      biografia: new fields.StringField({ required: false, blank: true, initial: '' }),
      ocupacion: new fields.StringField({ required: false, blank: true, initial: '' }),
      nacionalidad: new fields.StringField({ required: false, blank: true, initial: '' }),
      apariencia: new fields.StringField({ required: false, blank: true, initial: '' }),
      notas: new fields.StringField({ required: false, blank: true, initial: '' }),
      edad: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 20, min: 0 }),
      dinero: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
      
      salud: new fields.SchemaField({
        umbral: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        total: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        actual: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
      }),
      heridas: new fields.SchemaField({
        leve1: new fields.BooleanField({ required: false, initial: false }),
        leve2: new fields.BooleanField({ required: false, initial: false }),
        grave1: new fields.BooleanField({ required: false, initial: false }),
        grave2: new fields.BooleanField({ required: false, initial: false }),
        leveTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        graveTexto: new fields.StringField({ required: false, blank: true, initial: '' })
      }),
      energia: new fields.SchemaField({
        actual: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 5, min: 0 }),
        maxima: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 5, min: 0 })
      }),
      
      distorcion: new fields.SchemaField({
        1: new fields.BooleanField({ required: false, initial: false }),
        2: new fields.BooleanField({ required: false, initial: false }),
        3: new fields.BooleanField({ required: false, initial: false }),
        4: new fields.BooleanField({ required: false, initial: false }),
        5: new fields.BooleanField({ required: false, initial: false }),
        6: new fields.BooleanField({ required: false, initial: false }),
        7: new fields.BooleanField({ required: false, initial: false }),
        8: new fields.BooleanField({ required: false, initial: false }),
        9: new fields.BooleanField({ required: false, initial: false }),
        10: new fields.BooleanField({ required: false, initial: false })
      }),
      drama: new fields.SchemaField({
        1: new fields.BooleanField({ required: false, initial: false }),
        2: new fields.BooleanField({ required: false, initial: false }),
        3: new fields.BooleanField({ required: false, initial: false }),
        4: new fields.BooleanField({ required: false, initial: false }),
        5: new fields.BooleanField({ required: false, initial: false }),
        experiencia: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
      }),
      extasis: new fields.SchemaField({
        1: new fields.BooleanField({ required: false, initial: false }),
        2: new fields.BooleanField({ required: false, initial: false }),
        3: new fields.BooleanField({ required: false, initial: false }),
        4: new fields.BooleanField({ required: false, initial: false }),
        5: new fields.BooleanField({ required: false, initial: false }),
        6: new fields.BooleanField({ required: false, initial: false }),
        7: new fields.BooleanField({ required: false, initial: false }),
        8: new fields.BooleanField({ required: false, initial: false }),
        9: new fields.BooleanField({ required: false, initial: false }),
        10: new fields.BooleanField({ required: false, initial: false }),
        salida: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
      }),
      
      habilidades: new fields.SchemaField({
        formaFisica: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        formaFisicaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        combate: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        combateTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        percepcion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        percepcionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        subterfugio: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        subterfugioTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        comunicacion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        comunicacionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        cultura: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        culturaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        ocultismo: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        ocultismoTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        gestionEmocional: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        gestionEmocionalTexto: new fields.StringField({ required: false, blank: true, initial: '' })
      }),
      habilidadesArcanas: new fields.ArrayField(new fields.SchemaField({
        nombre: new fields.StringField({ required: false, blank: true, initial: '' }),
        valor: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0, max: 99 }),
        innata: new fields.BooleanField({ required: false, initial: false }),
        aprendida: new fields.BooleanField({ required: false, initial: false })
      }), { required: false, initial: [] }),
      combate: new fields.SchemaField({
        iniciativa: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        rd: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        danoDis: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        danoCC: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
        armas: new fields.ArrayField(new fields.SchemaField({
          nombre: new fields.StringField({ required: false, blank: true, initial: '' }),
          valor: new fields.StringField({ required: false, blank: true, initial: '' }),
          dadoM: new fields.BooleanField({ required: false, initial: false }),
          dadoC: new fields.BooleanField({ required: false, initial: false }),
          dadoMayor: new fields.BooleanField({ required: false, initial: false })
        }), { required: false, initial: [] })
      }),
      
      atributos: new fields.SchemaField({
        fuerza: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
        fuerzaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        destreza: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
        destrezaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        voluntad: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
        voluntadTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        percepcion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
        percepcionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
        carisma: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
        carismaTexto: new fields.StringField({ required: false, blank: true, initial: '' })
      }),
      
      hitos: new fields.ArrayField(new fields.SchemaField({
        texto: new fields.StringField({ required: false, blank: true, initial: '' })
      }), { required: false, initial: [] }),
      complicaciones: new fields.ArrayField(new fields.SchemaField({
        texto: new fields.StringField({ required: false, blank: true, initial: '' })
      }), { required: false, initial: [] }),
      logros: new fields.ArrayField(new fields.SchemaField({
        texto: new fields.StringField({ required: false, blank: true, initial: '' })
      }), { required: false, initial: [] }),
      recursos: new fields.ArrayField(new fields.SchemaField({
        nombre: new fields.StringField({ required: false, blank: true, initial: '' }),
        valor: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0, max: 99 })
      }), { required: false, initial: [] }),
      inventario: new fields.ArrayField(new fields.SchemaField({
        texto: new fields.StringField({ required: false, blank: true, initial: '' })
      }), { required: false, initial: [] }),
      
      copia: new fields.SchemaField({
        salud: new fields.SchemaField({
          umbral: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          total: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          actual: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
        }),
        heridas: new fields.SchemaField({
          leve1: new fields.BooleanField({ required: false, initial: false }),
          leve2: new fields.BooleanField({ required: false, initial: false }),
          grave1: new fields.BooleanField({ required: false, initial: false }),
          grave2: new fields.BooleanField({ required: false, initial: false }),
          leveTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          graveTexto: new fields.StringField({ required: false, blank: true, initial: '' })
        }),
        distorcion: new fields.SchemaField({
          1: new fields.BooleanField({ required: false, initial: false }),
          2: new fields.BooleanField({ required: false, initial: false }),
          3: new fields.BooleanField({ required: false, initial: false }),
          4: new fields.BooleanField({ required: false, initial: false }),
          5: new fields.BooleanField({ required: false, initial: false }),
          6: new fields.BooleanField({ required: false, initial: false }),
          7: new fields.BooleanField({ required: false, initial: false }),
          8: new fields.BooleanField({ required: false, initial: false }),
          9: new fields.BooleanField({ required: false, initial: false }),
          10: new fields.BooleanField({ required: false, initial: false })
        }),
        drama: new fields.SchemaField({
          1: new fields.BooleanField({ required: false, initial: false }),
          2: new fields.BooleanField({ required: false, initial: false }),
          3: new fields.BooleanField({ required: false, initial: false }),
          4: new fields.BooleanField({ required: false, initial: false }),
          5: new fields.BooleanField({ required: false, initial: false }),
          experiencia: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
        }),
        extasis: new fields.SchemaField({
          1: new fields.BooleanField({ required: false, initial: false }),
          2: new fields.BooleanField({ required: false, initial: false }),
          3: new fields.BooleanField({ required: false, initial: false }),
          4: new fields.BooleanField({ required: false, initial: false }),
          5: new fields.BooleanField({ required: false, initial: false }),
          6: new fields.BooleanField({ required: false, initial: false }),
          7: new fields.BooleanField({ required: false, initial: false }),
          8: new fields.BooleanField({ required: false, initial: false }),
          9: new fields.BooleanField({ required: false, initial: false }),
          10: new fields.BooleanField({ required: false, initial: false }),
          salida: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 })
        }),
        atributos: new fields.SchemaField({
          fuerza: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
          fuerzaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          destreza: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
          destrezaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          voluntad: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
          voluntadTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          percepcion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
          percepcionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          carisma: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 1, min: 0 }),
          carismaTexto: new fields.StringField({ required: false, blank: true, initial: '' })
        }),
        habilidades: new fields.SchemaField({
          formaFisica: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          formaFisicaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          combate: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          combateTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          percepcion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          percepcionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          subterfugio: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          subterfugioTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          comunicacion: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          comunicacionTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          cultura: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          culturaTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          ocultismo: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          ocultismoTexto: new fields.StringField({ required: false, blank: true, initial: '' }),
          gestionEmocional: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          gestionEmocionalTexto: new fields.StringField({ required: false, blank: true, initial: '' })
        }),
        habilidadesArcanas: new fields.ArrayField(new fields.SchemaField({
          nombre: new fields.StringField({ required: false, blank: true, initial: '' }),
          valor: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0, max: 99 }),
          innata: new fields.BooleanField({ required: false, initial: false }),
          aprendida: new fields.BooleanField({ required: false, initial: false })
        }), { required: false, initial: [] }),
        combate: new fields.SchemaField({
          iniciativa: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          rd: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          danoDis: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          danoCC: new fields.NumberField({ required: false, nullable: false, integer: true, initial: 0, min: 0 }),
          armas: new fields.ArrayField(new fields.SchemaField({
            nombre: new fields.StringField({ required: false, blank: true, initial: '' }),
            valor: new fields.StringField({ required: false, blank: true, initial: '' }),
            dadoM: new fields.BooleanField({ required: false, initial: false }),
            dadoC: new fields.BooleanField({ required: false, initial: false }),
            dadoMayor: new fields.BooleanField({ required: false, initial: false })
          }), { required: false, initial: [] })
        })
      }),
      pnj: new fields.SchemaField({
        motivacion: new fields.StringField({ required: false, blank: true, initial: '' }),
        historia: new fields.StringField({ required: false, blank: true, initial: '' }),
        notas: new fields.StringField({ required: false, blank: true, initial: '' })
      })
    };
  }
}