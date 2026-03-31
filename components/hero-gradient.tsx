'use client'

import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'

export function HeroGradient() {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}
      pointerEvents="none"
    >
      <ShaderGradient
        animate="on"
        axesHelper="off"
        brightness={1.2}
        cAzimuthAngle={170}
        cDistance={2.59}
        cPolarAngle={70}
        cameraZoom={1}
        color1="#ffffff"
        color2="#277aff"
        color3="#ffffff"
        destination="onCanvas"
        embedMode="off"
        envPreset="city"
        format="gif"
        fov={60}
        frameRate={10}
        gizmoHelper="hide"
        grain="off"
        lightType="3d"
        pixelDensity={0.6}
        positionX={0}
        positionY={0.9}
        positionZ={-0.3}
        range="disabled"
        rangeEnd={40}
        rangeStart={0}
        reflection={0.1}
        rotationX={45}
        rotationY={0}
        rotationZ={0}
        shader="defaults"
        type="waterPlane"
        uAmplitude={4.3}
        uDensity={1.6}
        uFrequency={0}
        uSpeed={0.4}
        uStrength={0.7}
        uTime={0}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  )
}
