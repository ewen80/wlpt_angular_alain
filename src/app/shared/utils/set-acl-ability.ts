import { ACLService } from "@delon/acl";
import { Permission } from "src/app/domains/iresource-range-permission-wrapper";

/**
 * 
 * @param value 
 * @param digits 
 * @returns 
 */
export function setAclAbility(permissions: Array<{ mask: Permission }>, acl: ACLService): void {
    if (permissions.some(item => item.mask === Permission.WRITE)) {
        acl.attachAbility(['WRITE']);
      } else {
        acl.removeAbility(['WRITE']);
      }
      if (permissions.some(item => item.mask === Permission.CREATE)) {
        acl.attachAbility(['CREATE']);
      } else {
        acl.removeAbility(['CREATE']);
      }
      if (permissions.some(item => item.mask === Permission.DELETE)) {
        acl.attachAbility(['DELETE']);
      } else {
        acl.removeAbility(['DELETE']);
      }
      if (permissions.some(item => item.mask === Permission.FINISH)) {
        acl.attachAbility(['FINISH']);
      } else {
        acl.removeAbility(['FINISH']);
      }
      if (permissions.some(item => item.mask === Permission.READ)) {
        acl.attachAbility(['READ']);
      } else {
        acl.removeAbility(['READ']);
      }
  }
  