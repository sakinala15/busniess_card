import { Component, type OnInit, ViewChild, type ElementRef, type Renderer2 } from "@angular/core"
import type { BusinessCardService } from "./business-card.service"
import interact from "interactjs"
import html2canvas from "html2canvas"
import QRCode from "qrcode"

@Component({
  selector: "app-business-card-editor",
  templateUrl: "./business-card-editor.component.html",
  styleUrls: ["./business-card-editor.component.css"],
})
export class BusinessCardEditorComponent implements OnInit {
  @ViewChild("card1", { static: true }) businessCard!: ElementRef
  @ViewChild("contextMenu", { static: true }) contextMenu!: ElementRef
  @ViewChild("resizeMenu", { static: true }) resizeMenu!: ElementRef

  currentElement: HTMLElement | null = null
  historyStack: string[] = []

  constructor(
    private renderer: Renderer2,
    private businessCardService: BusinessCardService,
  ) {}

  ngOnInit() {
    this.initializeInteractJS()
    this.initializeContextMenu()
    this.initializeResizeMenu()
    this.initializeThemeSelector()
    this.initializeCustomTheme()
    this.initializeAddTextButton()
    this.initializeSocialButtons()
    this.initializeDownloadButton()
    this.initializeQRCodeButton()
    this.initializeResetButton()
    this.initializeAddLineButtons()
    this.initializeProfileImageUpload()
  }

  initializeInteractJS() {
    interact(".draggable").draggable({
      inertia: true,
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement
          const x = (Number.parseFloat(target.getAttribute("data-x") || "0") || 0) + event.dx
          const y = (Number.parseFloat(target.getAttribute("data-y") || "0") || 0) + event.dy
          this.renderer.setStyle(target, "transform", `translate(${x}px, ${y}px)`)
          this.renderer.setAttribute(target, "data-x", x.toString())
          this.renderer.setAttribute(target, "data-y", y.toString())
        },
      },
    })

    interact("#card1").resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      listeners: {
        move: (event) => {
          const target = event.target as HTMLElement
          let { x, y } = target.dataset
          x = (Number.parseFloat(x || "0") || 0) + event.deltaRect.left
          y = (Number.parseFloat(y || "0") || 0) + event.deltaRect.top
          Object.assign(target.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x}px, ${y}px)`,
          })
          Object.assign(target.dataset, { x, y })
        },
      },
    })
  }

  initializeContextMenu() {
    this.renderer.listen("document", "contextmenu", (event: MouseEvent) => {
      if ((event.target as HTMLElement).classList.contains("editable")) {
        event.preventDefault()
        this.currentElement = event.target as HTMLElement
        this.renderer.setStyle(this.contextMenu.nativeElement, "top", `${event.clientY}px`)
        this.renderer.setStyle(this.contextMenu.nativeElement, "left", `${event.clientX}px`)
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "block")
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
      }
    })

    this.renderer.listen("document", "click", (event: MouseEvent) => {
      if (
        !this.contextMenu.nativeElement.contains(event.target) &&
        !this.resizeMenu.nativeElement.contains(event.target)
      ) {
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
      }
    })
  }

  initializeResizeMenu() {
    this.renderer.listen(this.businessCard.nativeElement, "contextmenu", (event: MouseEvent) => {
      if (!(event.target as HTMLElement).classList.contains("editable")) {
        event.preventDefault()
        this.renderer.setStyle(this.resizeMenu.nativeElement, "top", `${event.clientY}px`)
        this.renderer.setStyle(this.resizeMenu.nativeElement, "left", `${event.clientX}px`)
        this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "block")
        this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      }
    })
  }

  applyFont() {
    if (this.currentElement) {
      const fontFamily = (document.getElementById("fontFamily") as HTMLSelectElement).value
      const fontSize = (document.getElementById("fontSize") as HTMLInputElement).value
      const textColor = (document.getElementById("textColor") as HTMLInputElement).value

      this.renderer.setStyle(this.currentElement, "fontFamily", fontFamily)
      this.renderer.setStyle(this.currentElement, "fontSize", `${fontSize}px`)
      this.renderer.setStyle(this.currentElement, "color", textColor)
      this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      this.trackChanges()
    }
  }

  toggleBold() {
    if (this.currentElement) {
      const isBold = this.currentElement.style.fontWeight === "bold"
      this.renderer.setStyle(this.currentElement, "fontWeight", isBold ? "normal" : "bold")
      this.trackChanges()
    }
  }

  toggleItalic() {
    if (this.currentElement) {
      const isItalic = this.currentElement.style.fontStyle === "italic"
      this.renderer.setStyle(this.currentElement, "fontStyle", isItalic ? "normal" : "italic")
      this.trackChanges()
    }
  }

  toggleUnderline() {
    if (this.currentElement) {
      const isUnderlined = this.currentElement.style.textDecoration === "underline"
      this.renderer.setStyle(this.currentElement, "textDecoration", isUnderlined ? "none" : "underline")
      this.trackChanges()
    }
  }

  removeElement() {
    if (this.currentElement) {
      this.renderer.removeChild(this.currentElement.parentNode, this.currentElement)
      this.renderer.setStyle(this.contextMenu.nativeElement, "display", "none")
      this.trackChanges()
    }
  }

  resizeCard() {
    const cardWidth = (document.getElementById("cardWidth") as HTMLInputElement).value
    const cardHeight = (document.getElementById("cardHeight") as HTMLInputElement).value

    if (cardWidth) {
      this.renderer.setStyle(this.businessCard.nativeElement, "width", `${cardWidth}px`)
    }
    if (cardHeight) {
      this.renderer.setStyle(this.businessCard.nativeElement, "height", `${cardHeight}px`)
    }
    this.renderer.setStyle(this.resizeMenu.nativeElement, "display", "none")
    this.trackChanges()
  }

  initializeThemeSelector() {
    this.renderer.listen(document.getElementById("themeSelector"), "change", (event: Event) => {
      const selectedTheme = (event.target as HTMLSelectElement).value
      const themeClasses = [
        "theme-default",
        "theme-dark",
        "theme-corporate",
        "theme-modern",
        "theme-gradient-1",
        "theme-gradient-2",
        "theme-gradient-3",
        "theme-rich-blue",
        "theme-rich-purple",
        "theme-rich-green",
        "theme-multishade-orange",
        "theme-multishade-pink",
        "theme-multishade-aqua",
      ]

      themeClasses.forEach((themeClass) => {
        this.renderer.removeClass(this.businessCard.nativeElement, themeClass)
      })

      if (selectedTheme) {
        this.renderer.addClass(this.businessCard.nativeElement, selectedTheme)
      }
      this.trackChanges()
    })
  }

  initializeCustomTheme() {
    this.renderer.listen(document.getElementById("applyCustomTheme"), "click", () => {
      const bgColor = (document.getElementById("customBgColor") as HTMLInputElement).value
      const textColor = (document.getElementById("customTextColor") as HTMLInputElement).value

      this.renderer.setStyle(this.businessCard.nativeElement, "backgroundColor", bgColor)
      this.renderer.setStyle(this.businessCard.nativeElement, "color", textColor)
      this.trackChanges()
    })
  }

  initializeAddTextButton() {
    this.renderer.listen(document.getElementById("addTextButton"), "click", () => {
      const inputText = (document.getElementById("inputText") as HTMLInputElement).value
      if (inputText) {
        const newTextElement = this.renderer.createElement("p")
        this.renderer.addClass(newTextElement, "draggable")
        this.renderer.addClass(newTextElement, "editable")
        this.renderer.setProperty(newTextElement, "innerHTML", `<i class="fas fa-info-circle"></i> ${inputText}`)
        this.renderer.appendChild(document.getElementById("contactInfo"), newTextElement)
        this.makeEditable(newTextElement)
        this.initializeInteractJS()
        this.trackChanges()
      }
    })
  }

  initializeSocialButtons() {
    const socialButtons = [
      { id: "addFacebook", icon: "fab fa-facebook", name: "Facebook" },
      { id: "addTwitter", icon: "fab fa-twitter", name: "Twitter" },
      { id: "addLinkedIn", icon: "fab fa-linkedin", name: "LinkedIn" },
      { id: "addInstagram", icon: "fab fa-instagram", name: "Instagram" },
    ]

    socialButtons.forEach((button) => {
      this.renderer.listen(document.getElementById(button.id), "click", () => {
        this.addSocialIcon(button.icon, button.name)
      })
    })
  }

  addSocialIcon(iconClass: string, iconName: string) {
    const newIconElement = this.renderer.createElement("p")
    this.renderer.addClass(newIconElement, "draggable")
    this.renderer.addClass(newIconElement, "editable")
    this.renderer.setProperty(newIconElement, "innerHTML", `<i class="${iconClass}"></i> ${iconName}`)
    this.renderer.appendChild(document.getElementById("contactInfo"), newIconElement)
    this.makeEditable(newIconElement)
    this.initializeInteractJS()
    this.trackChanges()
  }

  makeEditable(element: HTMLElement) {
    this.renderer.listen(element, "dblclick", () => {
      const originalHTML = element.innerHTML
      const textContent = element.textContent?.trim() || ""
      const iconClass = element.querySelector("i")?.className || null

      const input = this.renderer.createElement("input")
      this.renderer.setAttribute(input, "type", "text")
      this.renderer.setProperty(input, "value", textContent)
      this.renderer.setProperty(element, "innerHTML", "")
      this.renderer.appendChild(element, input)
      input.focus()

      this.renderer.listen(input, "blur", () => {
        if (iconClass) {
          this.renderer.setProperty(element, "innerHTML", `<i class="${iconClass}"></i> ${input.value}`)
        } else {
          this.renderer.setProperty(element, "innerHTML", input.value)
        }
        this.trackChanges()
      })
    })
  }

  initializeDownloadButton() {
    this.renderer.listen(document.getElementById("downloadBtn"), "click", () => {
      html2canvas(this.businessCard.nativeElement).then((canvas) => {
        const link = this.renderer.createElement("a")
        this.renderer.setAttribute(link, "href", canvas.toDataURL("image/png"))
        this.renderer.setAttribute(link, "download", "business_card.png")
        link.click()
      })
    })
  }

  initializeQRCodeButton() {
    this.renderer.listen(document.getElementById("generateQRCodeBtn"), "click", () => {
      html2canvas(this.businessCard.nativeElement)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png")
          this.businessCardService
            .uploadImage(imgData)
            .then((url) => {
              const qrCodeContainer = document.getElementById("qrCodeContainer")
              if (qrCodeContainer) {
                qrCodeContainer.innerHTML = ""
                QRCode.toCanvas(qrCodeContainer, url, { width: 128, height: 128 }, (error) => {
                  if (error) console.error(error)
                  console.log("QR Code generated successfully")
                })
              }
              // Show QR code modal
              // Note: You'll need to implement this part using Angular's modal system or a third-party library
            })
            .catch((error) => {
              console.error("Error uploading image:", error)
            })
        })
        .catch((error) => {
          console.error("Error generating image:", error)
        })
    })
  }

  initializeResetButton() {
    const initialContent = this.businessCard.nativeElement.innerHTML
    const initialStyle = {
      width: this.businessCard.nativeElement.style.width,
      height: this.businessCard.nativeElement.style.height,
    }

    this.renderer.listen(document.getElementById("resetBtn"), "click", () => {
      this.renderer.setProperty(this.businessCard.nativeElement, "innerHTML", initialContent)
      this.renderer.setStyle(this.businessCard.nativeElement, "width", initialStyle.width)
      this.renderer.setStyle(this.businessCard.nativeElement, "height", initialStyle.height)
      this.historyStack = []
      console.log("Reset to initial state.")
    })
  }

  initializeAddLineButtons() {
    this.renderer.listen(document.getElementById("addHorizontalLine"), "click", () => {
      const newLine = this.renderer.createElement("div")
      this.renderer.addClass(newLine, "line-horizontal")
      this.renderer.addClass(newLine, "editable")
      this.renderer.appendChild(this.businessCard.nativeElement, newLine)
      this.initializeInteractJS()
      this.trackChanges()
    })

    this.renderer.listen(document.getElementById("addVerticalLine"), "click", () => {
      const newLine = this.renderer.createElement("div")
      this.renderer.addClass(newLine, "line-vertical")
      this.renderer.addClass(newLine, "editable")
      this.renderer.appendChild(this.businessCard.nativeElement, newLine)
      this.initializeInteractJS()
      this.trackChanges()
    })
  }

  initializeProfileImageUpload() {
    const profileImg = document.getElementById("profileImg")
    if (profileImg) {
      this.renderer.listen(profileImg, "dblclick", () => {
        const input = this.renderer.createElement("input")
        this.renderer.setAttribute(input, "type", "file")
        this.renderer.setAttribute(input, "accept", "image/*")
        this.renderer.listen(input, "change", (event: Event) => {
          const file = (event.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
              this.renderer.setAttribute(profileImg, "src", e.target?.result as string)
            }
            reader.readAsDataURL(file)
          }
        })
        input.click()
      })
    }
  }

  trackChanges() {
    const currentContent = this.businessCard.nativeElement.innerHTML
    this.historyStack.push(currentContent)
    if (this.historyStack.length > 20) this.historyStack.shift()
  }
}

