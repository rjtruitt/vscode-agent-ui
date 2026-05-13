import { describe, it, expect } from 'vitest';
import { Input } from '../../src/components/Input';
import { ValidationError } from '../../src/utils/errors';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render a basic text input', () => {
      const html = Input.render({
        label: 'Name',
        placeholder: 'Enter name'
      });

      expect(html).toContain('class="vscode-input-wrapper');
      expect(html).toContain('type="text"');
      expect(html).toContain('Name');
      expect(html).toContain('placeholder="Enter name"');
    });

    it('should render without label', () => {
      const html = Input.render({
        placeholder: 'Search...'
      });

      expect(html).toContain('class="vscode-input-wrapper');
      expect(html).not.toContain('<label');
    });

    it('should render textarea', () => {
      const html = Input.render({
        type: 'textarea',
        label: 'Description',
        rows: 5
      });

      expect(html).toContain('<textarea');
      expect(html).toContain('rows="5"');
      expect(html).not.toContain('<input');
    });

    it('should render different input types', () => {
      const types: Array<'text' | 'password' | 'email' | 'number' | 'search' | 'url' | 'tel'> = [
        'text', 'password', 'email', 'number', 'search', 'url', 'tel'
      ];

      types.forEach(type => {
        const html = Input.render({ type, label: 'Test' });
        expect(html).toContain(`type="${type}"`);
      });
    });
  });

  describe('Value Handling', () => {
    it('should render with initial value for text input', () => {
      const html = Input.render({
        label: 'Name',
        value: 'John Doe'
      });

      expect(html).toContain('value="John Doe"');
    });

    it('should render with initial value for textarea', () => {
      const html = Input.render({
        type: 'textarea',
        label: 'Description',
        value: 'Some text'
      });

      expect(html).toContain('>Some text</textarea>');
    });

    it('should escape HTML in value', () => {
      const html = Input.render({
        label: 'Test',
        value: '<script>alert("xss")</script>'
      });

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('should handle empty value', () => {
      const html = Input.render({
        label: 'Test',
        value: ''
      });

      expect(html).toContain('value=""');
    });
  });

  describe('States and Modifiers', () => {
    it('should render disabled state', () => {
      const html = Input.render({
        label: 'Test',
        disabled: true
      });

      expect(html).toContain('disabled');
      expect(html).toContain('class="vscode-input-wrapper disabled');
    });

    it('should render required field', () => {
      const html = Input.render({
        label: 'Email',
        required: true
      });

      expect(html).toContain('required');
      expect(html).toContain('aria-required="true"');
      expect(html).toContain('<span class="required-mark">*</span>');
    });

    it('should render readonly state', () => {
      const html = Input.render({
        label: 'Test',
        readonly: true
      });

      expect(html).toContain('readonly');
    });

    it('should render with icon', () => {
      const html = Input.render({
        label: 'Search',
        icon: '🔍'
      });

      expect(html).toContain('has-icon');
      expect(html).toContain('<span class="input-icon">🔍</span>');
    });

    it('should render error state', () => {
      const html = Input.render({
        label: 'Email',
        error: 'Invalid email address'
      });

      expect(html).toContain('has-error');
      expect(html).toContain('aria-invalid="true"');
      expect(html).toContain('Invalid email address');
      expect(html).toContain('role="alert"');
    });

    it('should render description', () => {
      const html = Input.render({
        label: 'Password',
        description: 'Must be at least 8 characters'
      });

      expect(html).toContain('class="input-description"');
      expect(html).toContain('Must be at least 8 characters');
    });

    it('should not show description when error is present', () => {
      const html = Input.render({
        label: 'Email',
        description: 'Enter your email',
        error: 'Invalid email'
      });

      expect(html).not.toContain('class="input-description"');
      expect(html).toContain('class="input-error"');
    });
  });

  describe('Validation Attributes', () => {
    it('should render minLength and maxLength', () => {
      const html = Input.render({
        label: 'Username',
        minLength: 3,
        maxLength: 20
      });

      expect(html).toContain('minlength="3"');
      expect(html).toContain('maxlength="20"');
    });

    it('should render number constraints', () => {
      const html = Input.render({
        type: 'number',
        label: 'Age',
        min: 0,
        max: 120,
        step: 1
      });

      expect(html).toContain('min="0"');
      expect(html).toContain('max="120"');
      expect(html).toContain('step="1"');
    });
  });

  describe('Event Handlers', () => {
    it('should render oninput handler', () => {
      const html = Input.render({
        label: 'Search',
        oninput: 'handleInput'
      });

      expect(html).toContain('oninput="handleInput(event)"');
    });

    it('should render onchange handler', () => {
      const html = Input.render({
        label: 'Select',
        onchange: 'handleChange'
      });

      expect(html).toContain('onchange="handleChange(event)"');
    });
  });

  describe('Accessibility', () => {
    it('should include aria-describedby', () => {
      const html = Input.render({
        label: 'Test',
        id: 'test-input'
      });

      expect(html).toContain('aria-describedby="test-input-desc"');
    });

    it('should link label to input with for/id', () => {
      const html = Input.render({
        label: 'Email',
        id: 'email-input'
      });

      expect(html).toContain('for="email-input"');
      expect(html).toContain('id="email-input"');
    });

    it('should generate unique ID when not provided', () => {
      const html1 = Input.render({ label: 'Test 1' });
      const html2 = Input.render({ label: 'Test 2' });

      const id1Match = html1.match(/id="(input-[a-z0-9]+)"/);
      const id2Match = html2.match(/id="(input-[a-z0-9]+)"/);

      expect(id1Match).not.toBeNull();
      expect(id2Match).not.toBeNull();
      expect(id1Match![1]).not.toBe(id2Match![1]);
    });
  });

  describe('XSS Protection', () => {
    it('should escape HTML in label', () => {
      const html = Input.render({
        label: '<script>alert("xss")</script>'
      });

      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>alert');
    });

    it('should escape HTML in placeholder', () => {
      const html = Input.render({
        label: 'Test',
        placeholder: '<img src=x onerror=alert(1)>'
      });

      expect(html).toContain('&lt;img src=x');
      expect(html).not.toContain('<img src=x');
    });

    it('should escape HTML in description', () => {
      const html = Input.render({
        label: 'Test',
        description: '<script>bad</script>'
      });

      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in error message', () => {
      const html = Input.render({
        label: 'Test',
        error: '<script>alert(1)</script>'
      });

      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in name attribute', () => {
      const html = Input.render({
        label: 'Test',
        name: '"><script>alert(1)</script>'
      });

      expect(html).toContain('&quot;&gt;&lt;script&gt;');
      expect(html).not.toContain('"><script>');
    });
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for invalid label type', () => {
      expect(() => {
        Input.render({
          label: 123 as any
        });
      }).toThrow(ValidationError);

      try {
        Input.render({ label: 123 as any });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_LABEL');
        expect((error as ValidationError).field).toBe('label');
      }
    });

    it('should throw ValidationError for invalid value type', () => {
      expect(() => {
        Input.render({
          label: 'Test',
          value: 123 as any
        });
      }).toThrow(ValidationError);

      try {
        Input.render({ label: 'Test', value: 123 as any });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_VALUE');
        expect((error as ValidationError).field).toBe('value');
      }
    });

    it('should throw ValidationError for invalid type', () => {
      expect(() => {
        Input.render({
          label: 'Test',
          type: 'invalid' as any
        });
      }).toThrow(ValidationError);

      try {
        Input.render({ label: 'Test', type: 'invalid' as any });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).code).toBe('INVALID_TYPE');
        expect((error as ValidationError).field).toBe('type');
      }
    });

    it('should throw ValidationError for invalid min on number input', () => {
      expect(() => {
        Input.render({
          type: 'number',
          label: 'Test',
          min: '10' as any
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid max on number input', () => {
      expect(() => {
        Input.render({
          type: 'number',
          label: 'Test',
          max: '100' as any
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid step on number input', () => {
      expect(() => {
        Input.render({
          type: 'number',
          label: 'Test',
          step: '5' as any
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid rows on textarea', () => {
      expect(() => {
        Input.render({
          type: 'textarea',
          label: 'Test',
          rows: '5' as any
        });
      }).toThrow(ValidationError);

      expect(() => {
        Input.render({
          type: 'textarea',
          label: 'Test',
          rows: 0
        });
      }).toThrow(ValidationError);
    });
  });

  describe('Custom Attributes', () => {
    it('should render custom className', () => {
      const html = Input.render({
        label: 'Test',
        className: 'my-custom-class'
      });

      expect(html).toContain('my-custom-class');
    });

    it('should render custom name attribute', () => {
      const html = Input.render({
        label: 'Test',
        name: 'user_email'
      });

      expect(html).toContain('name="user_email"');
    });

    it('should render custom id attribute', () => {
      const html = Input.render({
        label: 'Test',
        id: 'custom-id'
      });

      expect(html).toContain('id="custom-id"');
      expect(html).toContain('for="custom-id"');
    });
  });

  describe('Textarea Specific', () => {
    it('should render textarea with auto-resize', () => {
      const html = Input.render({
        type: 'textarea',
        label: 'Test',
        autoResize: true
      });

      expect(html).toContain('auto-resize');
    });

    it('should default to 3 rows for textarea', () => {
      const html = Input.render({
        type: 'textarea',
        label: 'Test'
      });

      expect(html).toContain('rows="3"');
    });
  });

  describe('Styles', () => {
    it('should return CSS styles', () => {
      const styles = Input.getStyles();

      expect(styles).toContain('.vscode-input-wrapper');
      expect(styles).toContain('.vscode-input');
      expect(styles).toContain('.input-label');
      expect(styles).toContain('.input-error');
    });
  });
});
