class DevelopmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DevelopmentError';
  }
}

export default DevelopmentError;
