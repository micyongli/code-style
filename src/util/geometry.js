function getGeometry(node) {
    let cssStyle = window.getComputedStyle(node)
    let prop = ['top', 'right', 'bottom', 'left']
    let margin = prop.map(a =>
       {
        let tag = cssStyle.getPropertyValue('margin-' + a)
        if (!tag)
            return 0
        let v = tag.split(' ')[0]
        return parseInt(v)
    })
    let border = prop.map(a => {
        let tag = cssStyle.getPropertyValue('border-' + a)
        if (!tag)
            return 0
        let v = tag.split(' ')[0]
        return parseInt(v)
    })
    let padding = prop.map(a =>{
        let tag = cssStyle.getPropertyValue('padding-' + a)
        if (!tag)
            return 0
        let v = tag.split(' ')[0]
        return parseInt(v)
    })
    let rect = node.getBoundingClientRect()
    return {
        width: rect.width,
        height: rect.height,
        contentWidth: rect.width - padding[1] - padding[3] - border[1] - border[3],
        contentHeight: rect.height - padding[0] - padding[2] - border[0] - border[2],
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        margin: margin,
        padding: padding,
        border: border
    }
}
export default getGeometry