<script lang="ts">
  import ResponsiveFlowChart, { type Step } from './responsive-flow-chart.svelte';

  let steps: Step[] = [
    {
      heading: 'Choose your recipients',
      text: 'A recipient can be any Ethereum address, GitHub repo, or even other Drip Lists.',
    },
    {
      heading: 'Publish and fund it',
      text: 'Once your list is published, you (or anyone) can send one-time or recurring funds to it.',
    },
    {
      heading: 'Funds cascade down',
      text: 'Your recipients take split incoming funds among their maintainers or to other projects.',
    },
  ];
</script>

<ResponsiveFlowChart bind:steps>
  <svg
    width="100%"
    viewBox="0 0 1110 994"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio
  >
    <path
      bind:this={steps[0].path}
      d="M601 184.5H1056.5V489C1056.5 501.979 1045.98 512.5 1033 512.5H601C588.021 512.5 577.5 501.979 577.5 489V208C577.5 195.021 588.021 184.5 601 184.5Z"
      stroke="#28333D"
    />
    <path
      bind:this={steps[1].path}
      d="M24 481.5H479.5V786C479.5 798.979 468.979 809.5 456 809.5H24C11.0213 809.5 0.5 798.979 0.5 786V505C0.5 492.021 11.0213 481.5 24 481.5Z"
      stroke="#28333D"
    />
    <path
      bind:this={steps[2].path}
      d="M601 665.5H1056.5V970C1056.5 982.979 1045.98 993.5 1033 993.5H601C588.021 993.5 577.5 982.979 577.5 970V689C577.5 676.021 588.021 665.5 601 665.5Z"
      stroke="#28333D"
    />
    <path d="M482 587.123H799C807.837 587.123 815 579.959 815 571.123V512.123" stroke="#28333D" />
    <path d="M492 597.123L482 587.123L492 577.123" stroke="#28333D" />
    <path d="M577 884.123H257C248.163 884.123 241 876.959 241 868.123V809.123" stroke="#28333D" />
    <path d="M568 894L578 884L568 874" stroke="#28333D" />
  </svg>
</ResponsiveFlowChart>
