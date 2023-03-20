window.onload = () => {
  function sayHelloWorld(): void {
    console.log("\n");
    console.log("*** Hello World from Type Script code. ***");
    console.log("\n");
  }
  
  sayHelloWorld();
  
  type ImageSize = { w: number, h: number };
  type Coordinate = { x: number, y: number };
  type Seam = Coordinate[];
  type EnergyMap = number[][];
  type Color = [
    r: number, // Red
    g: number, // Green
    b: number, // Blue
    a: number, // Alpha (transparency)
  ] | Uint8ClampedArray;

  type ResizeImageWidthArgs = {
    img: ImageData, // Image data we want to resize.
    toWidth: number, // Final image width we want the image to shrink to.
  };
  type ResizeImageWidthResult = {
    img: ImageData, // Resized image data.
    size: ImageSize, // Resized image size (w x h).
  };
  type SeamPixelMeta = {
    energy: number, // The energy of the pixel.
    coordinate: Coordinate, // The coordinate of the pixel.
    previous: Coordinate | null, // The previous pixel in a seam.
  };

  class ImgGenerator {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private img: HTMLImageElement;
  
    constructor(src: string) {
      let canvas = document.querySelector('#viewport') as HTMLCanvasElement;
      let context = canvas.getContext('2d') as CanvasRenderingContext2D;
      let img = new Image();
      img.src = src;
      this.img = img;
      this.canvas = canvas;
      this.context = context;
      this.CreateEvents();
    }
  
    private CreateEvents() {
      this.canvas.addEventListener("mousemove", (event: MouseEvent) => this.Pick(event, document.getElementById("hovered-color") as HTMLElement));
      this.canvas.addEventListener("click", (event: MouseEvent) => this.Pick(event, document.getElementById("selected-color") as HTMLElement));
      this.img.onload = () => {
        this.canvas.width = this.img.width / 2;
        this.canvas.height = this.img.height / 2;
        this.context.drawImage(this.img, 0, 0, this.img.width / 2, this.img.height / 2);
      }
    }
  
    public Pick(event: MouseEvent, destination: HTMLElement): string {
      const bounding = this.canvas.getBoundingClientRect();
      const x = event.clientX - bounding.left;
      const y = event.clientY - bounding.top;
      const pixel = this.context.getImageData(x, y, 1, 1);
      const data = pixel.data;
      const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
      destination.style.background = rgba;
      destination.textContent = rgba;
  
      return rgba;
    }

    public SetOriginal(): void {
      this.context.drawImage(this.img, 0, 0, this.img.width / 2, this.img.height / 2);
    }

    public Invert(): void {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        //* Fórmula = 255 - rgb value
        data[i] = 255 - data[i]; //? Red
        data[i + 1] = 255 - data[i + 1]; //? Green
        data[i + 2] = 255 - data[i + 2]; //? Blue
      }
      this.context.putImageData(imgData, 0, 0);
    }

    public SetGrayscale(): void {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        //* Fórmula = (red + green + blue) / 3
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg; //? Red
        data[i + 1] = avg; //? Green
        data[i + 2] = avg; //? Blue
      }
      this.context.putImageData(imgData, 0, 0);
    }

    public SetThreshold(threshold: number): void {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        //* Fórmula = (red + green + blue) / 3
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        data[i] = avg; //? Red
        data[i + 1] = avg; //? Green
        data[i + 2] = avg; //? Blue
        if (data[i] > threshold) data[i] = 255; else data[i] = 0
        if (data[i + 1] > threshold) data[i + 1] = 255; else data[i + 1] = 0
        if (data[i + 2] > threshold) data[i + 2] = 255; else data[i + 2] = 0
      }
      this.context.putImageData(imgData, 0, 0);
    }

    public SetThresholdWithoutBW(threshold: number): void {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > threshold) data[i] = 255; else data[i] = 0
        if (data[i + 1] > threshold) data[i + 1] = 255; else data[i + 1] = 0
        if (data[i + 2] > threshold) data[i + 2] = 255; else data[i + 2] = 0
      }
      this.context.putImageData(imgData, 0, 0);
    }

    public LogarithmicTransform(maxPixelValue: number) {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      const higher = Math.log(1 + this.GetHighestRGBValue());
      const c = maxPixelValue / Math.log(1 + higher);
      for (let i = 0; i < data.length; i += 4) {
        //* Fórmula = log(pixel + 1) * c
        data[i] = Math.log(data[i] + 1) * c;
        data[i + 1] = Math.log(data[i + 1] + 1) * c;
        data[i + 2] = Math.log(data[i + 2] + 1) * c;
      }
      this.context.putImageData(imgData, 0, 0);
    }

    public InverseLogarithmicTransform(maxPixelValue: number) {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      const b = 0.1;
      const c = maxPixelValue / Math.log(1 + (b * this.GetHighestRGBValue()));
      for (let i = 0; i < data.length; i += 4) {
        //* Fórmula = (exp(pixel) ^ (c / 1)) - 1
        data[i] = (Math.exp(data[i]) ** (1 / c)) - 1;
        data[i + 1] = (Math.exp(data[i + 1]) ** (1 / c)) - 1;
        data[i + 2] = (Math.exp(data[i + 2]) ** (1 / c)) - 1;
      }
      this.context.putImageData(imgData, 0, 0);
    }

    private GetHighestRGBValue(): number {
      const imgData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data: Uint8ClampedArray = imgData.data;
      let highestValue: number = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i] > highestValue) highestValue = data[i]
      }
      return highestValue;
    }

    // public ContentAwareResize({ img, toWidth }: ResizeImageWidthArgs): ResizeImageWidthResult {

    //   const size: ImageSize = { w: img.width, h: img.height };
    //   const pxToRemove = img.width - toWidth;
    //   if (pxToRemove < 0) {
    //     throw new Error('Upsizing is not supported for now');
    //   }

    //   let energyMap: EnergyMap | null = null;
    //   let seam: Seam | null = null;

    //   for (let i = 0; i < pxToRemove; i += 1) {
    //     // 1. Calculate the energy map for the current version of the image.
    //     energyMap = this.calculateEnergyMap(img, size);
    
    //     // 2. Find the seam with the lowest energy based on the energy map.
    //     seam = this.findLowEnergySeam(energyMap, size);
    
    //     // 3. Delete the seam with the lowest energy seam from the image.
    //     this.deleteSeam(img, seam, size);
    
    //     // Reduce the image width, and continue iterations.
    //     size.w -= 1;
    //   }

    //   return { img, size };
    // }

    // private getPixelEnergy(left: Color | null, middle: Color, right: Color | null): number {
    //   const [mR, mG, mB] = middle;

    //   let lEnergy = 0;
    //   if (left) {
    //     const [lR, lG, lB] = left;
    //     lEnergy = (lR - mR) ** 2 + (lG - mG) ** 2 + (lB - mB) ** 2;
    //   }

    //   let rEnergy = 0;
    //   if (right) {
    //     const [rR, rG, rB] = right;
    //     rEnergy = (rR - mR) ** 2 + (rG - mG) ** 2 + (rB - mB) ** 2;
    //   }

    //   return Math.sqrt(lEnergy + rEnergy);
    // }

    // private getPixel(img: ImageData, { x, y }: Coordinate): Color {
    //   const i = y * img.width + x;
    //   const cellsPerColor = 4; // RGBA
    //   // For better efficiency, instead of creating a new sub-array we return
    //   // a pointer to the part of the ImageData array.
    //   return img.data.subarray(i * cellsPerColor, i * cellsPerColor + cellsPerColor);
    // }

    // private setPixel(img: ImageData, { x, y }: Coordinate, color: Color): void {
    //   // The ImageData data array is a flat 1D array.
    //   // Thus we need to convert x and y coordinates to the linear index.
    //   const i = y * img.width + x;
    //   const cellsPerColor = 4; // RGBA
    //   img.data.set(color, i * cellsPerColor);
    // }

    // private setMatrix<T>(w: number, h: number, filler: T): T[][] {
    //   return new Array(h)
    //     .fill(null)
    //     .map(() => {
    //       return new Array(w).fill(filler);
    //     })
    // }

    // private calculateEnergyMap(img: ImageData, { w, h }: ImageSize): EnergyMap {
    //   const energyMap: number[][] = this.setMatrix<number>(w, h, Infinity);
    //   for (let y = 0; y < h; y += 1) {
    //     for (let x = 0; x < w; x += 1) {
    //       // Left pixel might not exist if we're on the very left edge of the image.
    //       const left = (x - 1) >= 0 ? this.getPixel(img, { x: x - 1, y }) : null;
    //       // The color of the middle pixel that we're calculating the energy for.
    //       const middle = this.getPixel(img, { x, y });
    //       // Right pixel might not exist if we're on the very right edge of the image.
    //       const right = (x + 1) < w ? this.getPixel(img, { x: x + 1, y }) : null;
    //       energyMap[y][x] = this.getPixelEnergy(left, middle, right);
    //     }
    //   }
    //   return energyMap;
    // }

    // private findLowEnergySeam(energyMap: EnergyMap, { w, h }: ImageSize): Seam {
    //   // The 2D array of the size of w and h, where each pixel contains the
    //   // seam metadata (pixel energy, pixel coordinate and previous pixel from
    //   // the lowest energy seam at this point).
    //   const seamsEnergies: (SeamPixelMeta | null)[][] = this.setMatrix<SeamPixelMeta | null>(w, h, null);

    //   // Populate the first row of the map by just copying the energies
    //   // from the energy map.
    //   for (let x = 0; x < w; x += 1) {
    //     const y = 0;
    //     seamsEnergies[y][x] = {
    //       energy: energyMap[y][x],
    //       coordinate: { x, y },
    //       previous: null,
    //     };
    //   }
    
    //   // Populate the rest of the rows.
    //   for (let y = 1; y < h; y += 1) {
    //     for (let x = 0; x < w; x += 1) {
    //       // Find the top adjacent cell with minimum energy.
    //       // This cell would be the tail of a seam with lowest energy at this point.
    //       // It doesn't mean that this seam (path) has lowest energy globally.
    //       // Instead, it means that we found a path with the lowest energy that may lead
    //       // us to the current pixel with the coordinates x and y.
    //       let minPrevEnergy = Infinity;
    //       let minPrevX: number = x;
    //       for (let i = (x - 1); i <= (x + 1); i += 1) {
    //         if (i >= 0 && i < w && seamsEnergies[y - 1][i]!.energy < minPrevEnergy) {
    //           minPrevEnergy = seamsEnergies[y - 1][i]!.energy;
    //           minPrevX = i;
    //         }
    //       }
        
    //       // Update the current cell.
    //       seamsEnergies[y][x] = {
    //         energy: minPrevEnergy + energyMap[y][x],
    //         coordinate: { x, y },
    //         previous: { x: minPrevX, y: y - 1 },
    //       };
    //     }
    //   }
    
    //   // Find where the minimum energy seam ends.
    //   // We need to find the tail of the lowest energy seam to start
    //   // traversing it from its tail to its head (from the bottom to the top).
    //   let lastMinCoordinate: Coordinate | null = null;
    //   let minSeamEnergy = Infinity;
    //   for (let x = 0; x < w; x += 1) {
    //     const y = h - 1;
    //     if (seamsEnergies[y][x]!.energy < minSeamEnergy) {
    //       minSeamEnergy = seamsEnergies[y][x]!.energy;
    //       lastMinCoordinate = { x, y };
    //     }
    //   }
    
    //   // Find the lowest energy energy seam.
    //   // Once we know where the tail is we may traverse and assemble the lowest
    //   // energy seam based on the "previous" value of the seam pixel metadata.
    //   const seam: Seam = [];
    //   if (!lastMinCoordinate) {
    //     return seam;
    //   }
    
    //   const { x: lastMinX, y: lastMinY } = lastMinCoordinate;
    
    //   // Adding new pixel to the seam path one by one until we reach the top.
    //   let currentSeam = seamsEnergies[lastMinY][lastMinX];
    //   while (currentSeam) {
    //     seam.push(currentSeam.coordinate);
    //     const prevMinCoordinates = currentSeam.previous;
    //     if (!prevMinCoordinates) {
    //       currentSeam = null;
    //     } else {
    //       const { x: prevMinX, y: prevMinY } = prevMinCoordinates;
    //       currentSeam = seamsEnergies[prevMinY][prevMinX];
    //     }
    //   }
    
    //   return seam;
    // }

    // private deleteSeam(img: ImageData, seam: Seam, { w }: ImageSize): void {
    //   seam.forEach(({ x: seamX, y: seamY }: Coordinate) => {
    //     for (let x = seamX; x < (w - 1); x += 1) {
    //       const nextPixel = this.getPixel(img, { x: x + 1, y: seamY });
    //       this.setPixel(img, { x, y: seamY }, nextPixel);
    //     }
    //   });
    // }
  }
   
  const img = new ImgGenerator('./img/sus.png');
  img.Invert();
  const btn = document.querySelector('#invert');
  btn?.addEventListener('click', () => {
    img.Invert();
  });
  const btn2 = document.querySelector('#grayscale');
  btn2?.addEventListener('click', () => {
    img.SetGrayscale();
  });
  const btnReset = document.querySelector('#reset');
  btnReset?.addEventListener('click', () => {
    img.SetOriginal();
  });
  const btnThreshold = document.querySelector('#threshold');
  const thresholdVal = document.querySelector('#threshold-val') as HTMLInputElement;
  const thresholdLabel = document.querySelector('#threshold-label') as HTMLElement;
  const logVal = document.querySelector('#log-val') as HTMLInputElement;
  const logLabel = document.querySelector('#log-label') as HTMLElement;
  thresholdVal?.addEventListener('change', () => {
    thresholdLabel.innerHTML = thresholdVal.value
  });
  logVal?.addEventListener('change', () => {
    logLabel.innerHTML = logVal.value
  });
  btnThreshold?.addEventListener('click', () => {
    img.SetOriginal();
    img.SetThreshold(Number(thresholdVal.value));
  });

  const btnThreshold2 = document.querySelector('#threshold2');
  btnThreshold2?.addEventListener('click', () => {
    img.SetOriginal();
    img.SetThresholdWithoutBW(Number(thresholdVal.value));
  });

  const btnLog = document.querySelector('#logtransform');
  btnLog?.addEventListener('click', () => {
    img.LogarithmicTransform(Number(logVal.value));
  });

  const btnInvLog = document.querySelector('#invlogtransform');
  btnInvLog?.addEventListener('click', () => {
    img.InverseLogarithmicTransform(Number(logVal.value));
  });
}
