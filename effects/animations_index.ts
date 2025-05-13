import styles from '@/styles/index.module.scss';

//ANIMATIONS TO BE APPLIED TO THE INDEX PAGE
export function indexAnimator(): void
{
    const landingRight = document.getElementById('portaitImage');
    if (!landingRight) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animationFrameId: number;

    const SMOOTHNESS = 0.02;

    function updateMousePosition (e: MouseEvent) 
    {
        const { innerWidth, innerHeight } = window;
        const x = e.clientX - innerWidth / 2;
        const y = e.clientY - innerHeight / 2;

        targetRotX = (y / (innerHeight / 2)) * -15;
        targetRotY = (x / (innerWidth / 2)) * 15;
    
        if (!animationFrameId) animate();
    }

    function animate ()
    {
        currentRotX += (targetRotX - currentRotX) * SMOOTHNESS;
        currentRotY += (targetRotY - currentRotY) * SMOOTHNESS;

        if (!landingRight) return;

        landingRight.style.setProperty('--rotateX', `${currentRotX}deg`);
        landingRight.style.setProperty('--rotateY', `${currentRotY}deg`);

        const movementX = Math.abs(targetRotX - currentRotX) > 0.01;
        const movementY = Math.abs(targetRotY - currentRotY) > 0.01;

        const isMoving = movementX || movementY;

        if (isMoving)
        {
            animationFrameId = requestAnimationFrame(animate);
        } else
        {
            animationFrameId = 0;
        }
    }

    document.addEventListener('mousemove', updateMousePosition);
}