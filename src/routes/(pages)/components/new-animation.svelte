<div class="new-animation">
  <span>N</span>
  <span>e</span>
  <span>w</span>
  <span>s</span>
</div>

<style>
  .new-animation {
    display: flex;
    align-items: center;
    gap: 0rem;
    border: 1px solid white;
    color: white;
    padding: 0 0.5rem;
    height: 1.75rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .new-animation span:nth-child(1) {
    animation: flip3D 5s infinite;
    animation-delay: 0.3s;
  }

  .new-animation span:nth-child(2) {
    animation: flip3D 5s infinite;
    animation-delay: 0.4s;
  }

  .new-animation span:nth-child(3) {
    animation: flip3D 5s infinite;
    animation-delay: 0.5s;
  }

  .new-animation span:nth-child(4) {
    animation: flip3D 5s infinite;
    animation-delay: 0.5s;
  }

  @keyframes flip3D {
    0% {
      transform: rotateY(0deg);
    }
    15% {
      transform: rotateY(360deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
</style>
