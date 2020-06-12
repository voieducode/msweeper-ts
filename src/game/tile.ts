export interface ITile {
  id: number;
  content: string | number;
  display: string;
  revealed: boolean;
  flagged: boolean;
  markedForNumberReveal: boolean;
  isNumber(): boolean;
  revealBomb(): ITile;
  explode(): ITile;
  clone(): ITile;
  isUnsafe(): boolean;
  hasBomb(): boolean;
}

export class Tile implements ITile {
  constructor(
    public id: number,
    public display: string = "",
    public content: string | number = "",
    public revealed: boolean = false,
    public flagged: boolean = false,
    public markedForNumberReveal = false
  ) {}

  public isNumber() {
    switch (this.content) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        return true;
    }
    return false;
  }

  public clone(): ITile {
    return new Tile(
      this.id,
      this.display,
      this.content,
      this.revealed,
      this.flagged,
      this.markedForNumberReveal
    );
  }

  public hasBomb(): boolean {
    return this.content === "💣";
  }

  public isUnsafe(): boolean {
    return !this.revealed && this.hasBomb() && !this.flagged;
  }

  public revealBomb(): ITile {
    const copy = this.clone();
    if (this.hasBomb()) {
      copy.revealed = true;
      copy.display = "💣";
    }

    return copy;
  }

  public explode(): ITile {
    const copy = this.clone();
    if (this.hasBomb()) {
      copy.display = "💥";
    } else if (this.flagged) {
      copy.display = "❌";
    }

    return copy;
  }
}
