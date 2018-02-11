import {View}   from 'arva-js/core/View.js'
import Surface from 'famous/core/Surface.js';
import {layout} from 'arva-js/layout/decorators.js';
import {UIRegular} from 'arva-kit/text/UIRegular';


@layout.nest()
export class InstructionBubble extends View {
    @layout.fullSize()
    background = new Surface({
        properties: {
            borderRadius: '4px',
            backgroundColor:'white',
            boxShadow: 'rgba(0, 0, 0, 0.16) -1px 0px 64px'
        }
    });


    @layout.translate(0, 0, 10)
    @layout.fullSize()
    text = new UIRegular({
        content: this.options.text,
        properties: {
            lineHeight: '48px',
            textAlign: 'center'
        }
    })
}

export class LeftArrowInstruction extends InstructionBubble {
    @layout.size(0, 0)
    @layout.translate(-8, 16, 10)
    @layout.stick.topLeft()
    arrow = new Surface({
        properties: {
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid white'
        }
    });
}

export class RightArrowInstruction extends InstructionBubble {
    @layout.size(0, 0)
    @layout.translate(-1, 16, 10)
    @layout.stick.topRight()
    arrow = new Surface({
        properties: {
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid white'
        }
    });
}
