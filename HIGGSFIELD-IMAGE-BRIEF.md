# Image brief (Higgsfield or a real photo shoot)

The Higgsfield account had **0 credits** when the site was built, so no images were
generated. Every slot below currently shows a designed "catalogue plate" and is
replaceable from the admin with no code changes.

**Real photography beats generated images for products, rentals and the team.**
Customers will be buying and renting the actual items, and generated product shots can
misrepresent them. Use generation for mood and section imagery, and photograph the
real inventory.

## Shared style (append to every prompt)

> dark navy studio background (#050816), single electric-blue rim light (#1E90FF),
> soft cyan fill, low-key cinematic lighting, shallow depth of field, clean surfaces,
> photographic, no text, no logos, no watermarks, no people's faces

Model: `gpt_image_2_6` (or Soul for photographic realism) at quality `high` and resolution `2k`.

## Slots

| Where | Admin location | Aspect | Prompt |
|---|---|---|---|
| Robot dog rental | Rental fleet > Robot Dog | 4:3 | A sleek four-legged robot dog standing mid-stride on a polished dark floor, matte white and graphite body panels, three-quarter view |
| Serving robot rental | Rental fleet > Serving Robot | 4:3 | A tall restaurant serving robot with three stacked trays carrying drinks, rounded white body, small display face, banquet hall softly out of focus behind |
| Robot costume rental | Rental fleet > Bumblebee Costume | 4:3 | A full-height wearable yellow-and-black robot costume on a stand, armoured panels, glowing blue eyes. *Generic design: don't reproduce the Transformers character* |
| Robotic arm rental | Rental fleet > Kuma | 4:3 | A six-axis robotic arm on a mobile cart drawing on paper at an expo booth, white and blue arm |
| iXi fleet | Rental fleet > iXi fleet | 4:3 | Five compact autonomous golf trolleys lined up on a fairway at dawn, carbon-grey bodies, blue status lights |
| Stardust rover | Rental fleet > Stardust | 4:3 | A six-wheel rocker-bogie student rover kit with a camera mast on a lab bench |
| iXi project cover | Projects > iXi | 21:9 | An autonomous golf trolley following a golfer's footsteps across a misty Kerala-style golf course, wide shot, golfer seen from behind |
| Perception Engine | Projects | 4:3 | Abstract visualisation of LiDAR point clouds and camera frustums mapping a room, blue lines on black |
| Motion Intelligence | Projects | 4:3 | Long-exposure light trails tracing a robot arm's smooth motion path in a dark lab |
| Humynex Cloud | Projects | 4:3 | A wall of dimly lit monitors showing robot battery and location telemetry, dark control room |
| Swarm Logic | Projects | 4:3 | Overhead shot of several small robots moving in coordinated paths on a dark floor, light trails |
| Bionic Actuation | Projects | 4:3 | Macro shot of a compact robotic joint actuator with exposed gears and a torque sensor |
| Product shots (19) | Products > each | 1:1 | "Studio product shot of a [part name] on a dark navy acrylic surface, top-down three-quarter angle". **Photograph the real stock instead where possible** |
| Team | Team > each | 4:5 | **Do not generate.** Use real portraits. They render greyscale and colour on hover. |

## Optional hero video (scroll-scrubbed)

The hero currently scrubs the rebranded 3D arm model with scroll. If you'd rather use a
filmed or generated clip:

1. Generate a 5 to 8 second, 16:9, slow 180° orbit of a robot on the brand background (`seedance_2_5` or `kling3_0`).
2. Re-encode for smooth scrubbing (every frame a keyframe):
   `ffmpeg -i in.mp4 -an -vf scale=1600:-2 -c:v libx264 -g 1 -crf 22 -pix_fmt yuv420p public/hero-scrub.mp4`
3. Swap `ArmScene` in `src/components/home/hero.tsx` for a `<video>` whose `currentTime` follows the same ScrollTrigger progress.
