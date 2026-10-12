

const LabelSource: any = {
  'male': {
    active: 'Activo',
    inactive: 'Inactivo',
    deleted: 'Eliminado',
    coming: 'PrÃ³ximo',
    natural: 'Persona FÃ­sica',
    legal: 'Persona JurÃ­dica',
    internal: 'Interno',
    private: 'Privado',
  },
  'female': {
    active: 'Activa',
    inactiva: 'Inactiva',
    deleted: 'Eliminada',
    coming: 'PrÃ³xima',
    natural: 'Persona FÃ­sica',
    legal: 'Persona JurÃ­dica',
    internal: 'Interna',
    private: 'Privada',
  },
  'error.login': 'Usuario o ContraseÃ±a invÃ¡lida',
  'error.fatal': 'No se pudo completar la solicitud, por favor intenta mÃ¡s tarde.',
  'error.signup': 'No se pudo crear completar la creaciÃ³n del usuario.',
  'error.alreadyExists': 'El usuario ya existe.',
  'error.userNotFound': 'El usuario no existe.',
  'error.searchProfileNotFound': 'El perfil de búsqueda no existe.',
};


export class LABEL {

  static exists(value: string): boolean {
    return !!(LabelSource[value]);
  }

  static parse(value: string, type: 'male' | 'female' | 'default' = 'male'): string {
    if (type === 'male') {
      return LabelSource.male[value];
    }

    if (type === 'default') {
      return LabelSource[value];
    }

    return LabelSource.female[value];
  }

  static errorFatal(): string {
    return LabelSource['error.fatal'];
  }

}


