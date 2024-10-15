<script lang="ts">
  import { onMount } from 'svelte';

  let isTouchscreenDevice = false;

  onMount(() => {
    isTouchscreenDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  let mousePosX = 0;

  function handleMouseMove(e: MouseEvent) {
    mousePosX = e.clientX;
  }

  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  let coins: SVGGElement[] = [];
  const initialCoinPositions: number[] = [];

  onMount(() => {
    coins.forEach((coin) => {
      initialCoinPositions.push(
        coin.getBoundingClientRect().left + coin.getBoundingClientRect().width / 2,
      );
    });
  });

  const COIN_POS_MULTIPLIERS = [1.9, 0.5, 0.6, 0.3, 1.7];

  $: {
    if (!isTouchscreenDevice) {
      coins.forEach((coin, index) => {
        // Multiplier should be min 0, max 40, depending on how far away the mouse is from the coin (the further the mouse, the less the coin moves)

        const coinCenter = initialCoinPositions[index];
        const distance = mousePosX - coinCenter;

        coin.style.transform = `translateX(${(distance / 200) * COIN_POS_MULTIPLIERS[index]}px)`;
      });
    }
  }
</script>

<svg
  width="1646"
  height="1152"
  viewBox="0 0 1646 1152"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g bind:this={coins[0]}>
    <path
      d="M1583.8 460.805C1617.73 496.393 1618.38 550.853 1585.24 582.444L1576.35 590.919L1514.92 526.48L1453.48 462.042L1462.37 453.567C1495.5 421.976 1549.87 425.216 1583.8 460.805Z"
      fill="var(--color-primary)"
      stroke="var(--color-foreground)"
    />
    <ellipse
      cx="82.8934"
      cy="89.0336"
      rx="82.8934"
      ry="89.0336"
      transform="matrix(-0.723754 0.690058 0.690058 0.723754 1513.47 404.841)"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M1467.5 571.684C1494.25 599.733 1537.14 602.169 1563.3 577.225C1589.46 552.281 1589.07 509.325 1562.33 481.276C1535.58 453.227 1492.7 450.792 1466.53 475.736C1440.37 500.68 1440.76 543.635 1467.5 571.684Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path d="M1527.37 432.366L1518.48 440.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1559.37 442.366L1550.48 450.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1583.37 460.366L1574.48 468.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1600.24 484.285L1591.35 492.759" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1609.31 516.064L1600.42 524.538" stroke="var(--color-foreground)" stroke-width="2" />
  </g>

  <g bind:this={coins[1]}>
    <path
      d="M1373.49 181.444C1324.34 182.856 1283.42 146.904 1282.11 101.142L1281.76 88.8668L1370.75 86.3094L1459.75 83.752L1460.1 96.0274C1461.42 141.789 1422.64 180.032 1373.49 181.444Z"
      fill="var(--color-primary)"
      stroke="var(--color-foreground)"
    />
    <ellipse
      cx="82.8934"
      cy="89.0336"
      rx="82.8934"
      ry="89.0336"
      transform="matrix(-0.0287242 -0.999587 -0.999587 0.0287242 1462.13 166.611)"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M1368.87 20.8287C1330.13 21.9419 1299.63 52.1905 1300.67 88.3233C1301.71 124.456 1333.9 152.903 1372.63 151.79C1411.37 150.677 1441.88 120.428 1440.84 84.2954C1439.8 48.1626 1407.61 19.7155 1368.87 20.8287Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path d="M1432.37 158.528L1432.02 146.252" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1403.53 175.623L1403.18 163.347" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1374.1 181.42L1373.75 169.144" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1345.04 177.956L1344.68 165.681" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M1315.35 163.436L1315 151.161" stroke="var(--color-foreground)" stroke-width="2" />
  </g>

  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M1486.48 38.8866C1467.15 38.8866 1450.48 22.2166 1450.48 2.8866C1450.48 22.2166 1433.81 38.8866 1414.48 38.8866C1433.81 38.8866 1450.48 55.5566 1450.48 74.8866C1450.48 55.5566 1467.15 38.8866 1486.48 38.8866Z"
    fill="var(--color-background)"
    stroke="var(--color-foreground)"
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M1390.48 550.887C1371.15 550.887 1354.48 534.217 1354.48 514.887C1354.48 534.217 1337.81 550.887 1318.48 550.887C1337.81 550.887 1354.48 567.557 1354.48 586.887C1354.48 567.557 1371.15 550.887 1390.48 550.887Z"
    fill="var(--color-background)"
    stroke="var(--color-foreground)"
  />

  <g bind:this={coins[2]}>
    <path
      d="M231.799 963.805C265.73 999.393 266.377 1053.85 233.243 1085.44L224.355 1093.92L162.916 1029.48L101.478 965.042L110.366 956.567C143.5 924.976 197.867 928.216 231.799 963.805Z"
      fill="var(--color-primary)"
      stroke="var(--color-foreground)"
    />
    <ellipse
      cx="82.8934"
      cy="89.0336"
      rx="82.8934"
      ry="89.0336"
      transform="matrix(-0.723754 0.690058 0.690058 0.723754 161.472 907.841)"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M115.505 1074.68C142.248 1102.73 185.136 1105.17 211.298 1080.22C237.46 1055.28 237.071 1012.32 210.328 984.276C183.585 956.227 140.696 953.792 114.534 978.736C88.3723 1003.68 88.7619 1046.64 115.505 1074.68Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path d="M175.372 935.366L166.484 943.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M207.372 945.366L198.484 953.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M231.372 963.366L222.484 971.84" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M248.24 987.285L239.352 995.76" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M257.308 1019.06L248.42 1027.54" stroke="var(--color-foreground)" stroke-width="2" />
  </g>

  <g bind:this={coins[3]}>
    <path
      d="M193.867 205.145C162.206 242.767 108.143 249.37 73.1158 219.892L63.7197 211.985L121.047 143.863L178.375 75.7419L187.771 83.6492C222.799 113.127 225.528 167.522 193.867 205.145Z"
      fill="var(--color-primary)"
      stroke="var(--color-foreground)"
    />
    <ellipse
      cx="82.8934"
      cy="89.0336"
      rx="82.8934"
      ry="89.0336"
      transform="matrix(-0.765119 -0.643889 -0.643889 0.765119 241.799 129.116)"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M70.9263 101.683C45.9727 131.335 48.2453 174.233 75.9026 197.508C103.56 220.783 146.215 215.695 171.169 186.043C196.122 156.391 193.85 113.494 166.192 90.2185C138.535 66.9434 95.88 72.0316 70.9263 101.683Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path d="M215.959 145.944L206.563 138.037" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M209.521 178.846L200.125 170.939" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M194.256 204.672L184.86 196.765" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M172.326 224.057L162.93 216.149" stroke="var(--color-foreground)" stroke-width="2" />
    <path d="M141.731 236.548L132.335 228.641" stroke="var(--color-foreground)" stroke-width="2" />
  </g>

  <g bind:this={coins[4]}>
    <path
      d="M231.856 640.599L198.32 640.599M186.815 717.832L126 717.831M205.265 665.674L144.45 665.674M186.815 743.91L158 743.91M194.448 691.753L165.633 691.753M194.448 769.989L133.633 769.989M205.265 796.067L176.45 796.067M231.856 821.143H171.04"
      stroke="var(--color-foreground)"
    />
    <path
      d="M198.46 736.987C198.46 789.756 244.279 832.591 300.873 832.591C357.467 832.591 403.286 789.756 403.286 736.987L403.286 723.249L300.873 723.249L198.46 723.249L198.46 736.987Z"
      fill="var(--color-primary)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M300.873 627.144C244.279 627.144 198.46 669.979 198.46 722.749C198.46 775.518 244.279 818.354 300.873 818.354C357.467 818.354 403.286 775.518 403.286 722.749C403.286 669.979 357.467 627.144 300.873 627.144Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <path
      d="M300.873 646.721C256.041 646.721 219.753 680.79 219.753 722.749C219.753 764.708 256.041 798.777 300.873 798.777C345.706 798.777 381.994 764.708 381.994 722.749C381.994 680.79 345.706 646.721 300.873 646.721Z"
      fill="var(--color-background)"
      stroke="var(--color-foreground)"
    />
    <line
      y1="-0.5"
      x2="14.2378"
      y2="-0.5"
      transform="matrix(-4.35797e-08 -1 -1 4.38434e-08 368.432 807.666)"
      stroke="var(--color-foreground)"
    />
    <line
      y1="-0.5"
      x2="14.0423"
      y2="-0.5"
      transform="matrix(-4.35797e-08 -1 -1 4.38434e-08 334.432 826.724)"
      stroke="var(--color-foreground)"
    />
    <line
      y1="-0.5"
      x2="14.0423"
      y2="-0.5"
      transform="matrix(-4.49387e-08 -1 -1 4.52106e-08 301.432 831.739)"
      stroke="var(--color-foreground)"
    />
    <line
      y1="-0.5"
      x2="14.0423"
      y2="-0.5"
      transform="matrix(-4.47081e-08 -1 -1 4.49786e-08 267.432 826.724)"
      stroke="var(--color-foreground)"
    />
    <line
      y1="-0.5"
      x2="14.0423"
      y2="-0.5"
      transform="matrix(-4.35797e-08 -1 -1 4.38434e-08 233.432 808.669)"
      stroke="var(--color-foreground)"
    />
  </g>

  <path
    d="M383.782 825.236C384.046 842.252 397.749 855.999 414.717 856.265L414.717 857.278C397.749 857.544 384.046 871.291 383.782 888.306L382.774 888.306C382.51 871.291 368.807 857.544 351.84 857.278L351.84 856.264C368.807 855.999 382.51 842.252 382.774 825.236L383.782 825.236Z"
    stroke="var(--color-foreground)"
    stroke-linejoin="round"
  />
  <path
    d="M249.465 587.477C249.724 596.63 257.073 604.004 266.201 604.265L266.201 605.285C257.073 605.546 249.724 612.92 249.465 622.072L248.451 622.072C248.191 612.92 240.842 605.545 231.714 605.285L231.714 604.264C240.842 604.004 248.191 596.63 248.451 587.477L249.465 587.477Z"
    fill="var(--color-background)"
    stroke="var(--color-foreground)"
    stroke-linejoin="round"
  />
</svg>

<style>
  svg {
    width: 100% !important;
  }
</style>
